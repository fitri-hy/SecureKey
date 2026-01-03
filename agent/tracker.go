package main

import (
	"log"
	"net/http"
	"net/url"
)

func TrackSecret(secret, service, env, status string) {
	resp, err := http.PostForm("http://localhost:8080/log",
		url.Values{"secret": {secret}, "service": {service}, "env": {env}, "status": {status}})
	if err != nil {
		log.Println("Failed to send log to tracker:", err)
		return
	}
	defer resp.Body.Close()
	log.Printf("Sent secret %s usage to tracker [%s], status: %s\n", secret, status, resp.Status)
}
