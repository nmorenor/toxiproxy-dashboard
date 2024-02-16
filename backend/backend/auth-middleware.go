package backend

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type CustomClaims struct {
	Timestamp int64 `json:"timestamp"`
	jwt.Claims
}

func NewAuthMiddleware(jwtKey string) *AuthMiddleware {
	return &AuthMiddleware{jwtKey}
}

type AuthMiddleware struct {
	jwtKey string
}

func (auth *AuthMiddleware) authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenString := r.Header.Get("Authorization")
		if tokenString == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		// Extracting the Bearer token
		splitToken := strings.Split(tokenString, "Bearer ")
		if len(splitToken) != 2 {
			http.Error(w, "Invalid token format", http.StatusUnauthorized)
			return
		}
		tokenString = splitToken[1]

		// Parsing and validating the token
		token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
			// Normally, you'd supply your secret key here
			return []byte(auth.jwtKey), nil
		}, jwt.WithoutClaimsValidation())

		if err != nil || !token.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
			if (time.Now().UnixNano()/1000000)-claims.Timestamp > (1000 * 60 * 60 * 24) {
				http.Error(w, "Token expired", http.StatusUnauthorized)
				return
			}
		} else {
			fmt.Println(err)
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Token is valid
		next.ServeHTTP(w, r)
	})
}
