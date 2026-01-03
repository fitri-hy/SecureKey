package main

import "log"

func StartInterceptor() {
	secrets := []struct {
		name    string
		service string
		env     string
	}{
		{"API_KEY", "demo-service", "dev"},      // allowed
		{"DB_PASSWORD", "demo-service", "dev"},  // allowed
		{"API_KEY", "malicious-service", "prod"}, // kebocoran
	}

	for _, s := range secrets {
		if CheckPolicy(s.name, s.service, s.env) {
			log.Printf("[OK] Secret %s used by %s in %s\n", s.name, s.service, s.env)
			TrackSecret(s.name, s.service, s.env, "OK")
		} else {
			log.Printf("[BLOCK] Secret %s usage blocked for %s in %s\n", s.name, s.service, s.env)
			TrackSecret(s.name, s.service, s.env, "BLOCK")
		}
	}
}
