package main

import "log"

func main() {
	log.Println("SecuriKey Agent starting...")

	err := LoadPolicies("config.json")
	if err != nil {
		log.Fatal("Failed to load policies:", err)
	}

	StartInterceptor()

	log.Println("Agent finished execution")
}
