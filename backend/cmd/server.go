package main

import (
	"proxybackend/backend"
	"proxybackend/config"
)

func main() {
	jwtKey := config.Conf.Get("proxybackend.jwtsecret").(string)
	toxiproxyHost := config.Conf.Get("proxybackend.toxyproxyhostname").(string)
	user := config.Conf.Get("proxybackend.user").(string)
	password := config.Conf.Get("proxybackend.password").(string)
	proxyBackend := backend.NewProxyBackend(jwtKey, toxiproxyHost, user, password)
	proxyBackend.Start()
}
