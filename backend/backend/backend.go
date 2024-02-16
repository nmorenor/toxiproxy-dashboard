package backend

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	toxiproxy "github.com/Shopify/toxiproxy/v2/client"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
)

type ProxyBackend struct {
	jwtKey        string
	toxiproxyHost string
	user          string
	password      string
}

type Credentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type Toxic struct {
	Name       string               `json:"name"`
	Type       string               `json:"type"`
	Stream     string               `json:"stream"`
	Toxicity   float32              `json:"toxicity"`
	Attributes toxiproxy.Attributes `json:"attributes"`
}

func NewProxyBackend(jwtKey string, toxiproxyHost string, user string, password string) *ProxyBackend {
	return &ProxyBackend{
		jwtKey:        jwtKey,
		toxiproxyHost: toxiproxyHost,
		user:          user,
		password:      password,
	}
}

func (backend *ProxyBackend) Start() {
	authMiddleware := NewAuthMiddleware(backend.jwtKey)

	router := mux.NewRouter()

	dashboardStatic := "./dashboard"
	_, err := os.Stat(dashboardStatic)
	if os.IsNotExist(err) {
		panic("Dashboard directory does not exist: " + dashboardStatic)
	}
	router.PathPrefix("/dashboard/").Handler(http.StripPrefix("/dashboard/", http.FileServer(http.Dir(dashboardStatic))))
	router.HandleFunc("/api/login", backend.doLogin).Methods("POST")

	// Create a subrouter for routes that require authentication
	authRouter := router.PathPrefix("/api/toxiproxy").Subrouter()
	authRouter.Use(authMiddleware.authenticate)
	authRouter.HandleFunc("/proxies", backend.GetProxies).Methods("GET")
	authRouter.HandleFunc("/proxies/{proxyName}", backend.GetProxy).Methods("GET")
	authRouter.HandleFunc("/proxies/{proxyName}/toxics", backend.GetToxics).Methods("GET")
	authRouter.HandleFunc("/proxies/{proxyName}/toxics", backend.CreateToxic).Methods("POST")
	authRouter.HandleFunc("/proxies/{proxyName}/toxics/{toxicName}", backend.DeleteToxic).Methods("DELETE")
	srv := &http.Server{
		Handler: router,
		Addr:    "0.0.0.0:8000",
		// Good practice: enforce timeouts for servers you create!
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}
	log.Fatal(srv.ListenAndServe())
}

func (backend *ProxyBackend) doLogin(w http.ResponseWriter, r *http.Request) {
	// from json body get username and password
	var creds Credentials
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	// check if username and password match
	if creds.Username != backend.user || creds.Password != backend.password {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}
	// create a token with a timestamp
	claims := CustomClaims{
		Timestamp: time.Now().UnixNano() / 1000000,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(backend.jwtKey))
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf("{\"token\": \"%s\"}", tokenString)))
}

func (backend *ProxyBackend) GetProxies(w http.ResponseWriter, r *http.Request) {
	client := toxiproxy.NewClient(backend.toxiproxyHost)
	proxies, err := client.Proxies()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	jsonData, err := json.Marshal(proxies)
	if err != nil {
		log.Fatalf("Error serializing proxies to JSON: %v", err)
	}
	w.Write(jsonData)
}

func (backend *ProxyBackend) GetProxy(w http.ResponseWriter, r *http.Request) {
	client := toxiproxy.NewClient(backend.toxiproxyHost)
	proxyName := mux.Vars(r)["proxyName"]
	proxy, err := client.Proxy(proxyName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	jsonData, err := json.Marshal(proxy)
	if err != nil {
		log.Fatalf("Error serializing proxy to JSON: %v", err)
	}
	w.Write(jsonData)
}

func (backend *ProxyBackend) GetToxics(w http.ResponseWriter, r *http.Request) {
	client := toxiproxy.NewClient(backend.toxiproxyHost)
	proxyName := mux.Vars(r)["proxyName"]
	proxy, err := client.Proxy(proxyName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	toxics, err := proxy.Toxics()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	jsonData, err := json.Marshal(toxics)
	if err != nil {
		log.Fatalf("Error serializing toxics to JSON: %v", err)
	}
	w.Write(jsonData)
}

func (backend *ProxyBackend) CreateToxic(w http.ResponseWriter, r *http.Request) {
	client := toxiproxy.NewClient(backend.toxiproxyHost)
	proxyName := mux.Vars(r)["proxyName"]
	proxy, err := client.Proxy(proxyName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	var data Toxic
	err = json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	toxic, err := proxy.AddToxic(data.Name, data.Type, data.Stream, data.Toxicity, data.Attributes)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	jsonData, err := json.Marshal(toxic)
	if err != nil {
		log.Fatalf("Error serializing toxic to JSON: %v", err)
	}
	w.Write(jsonData)
}

func (backend *ProxyBackend) DeleteToxic(w http.ResponseWriter, r *http.Request) {
	client := toxiproxy.NewClient(backend.toxiproxyHost)
	proxyName := mux.Vars(r)["proxyName"]
	toxicName := mux.Vars(r)["toxicName"]
	proxy, err := client.Proxy(proxyName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	err = proxy.RemoveToxic(toxicName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
