package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func StartAPI() {
	http.HandleFunc("/secrets", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		rows, err := DB.Query(`SELECT secret_name, service, env, status, timestamp FROM secrets ORDER BY timestamp DESC LIMIT 50`)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var results []map[string]string
		for rows.Next() {
			var s, svc, env, status, ts string
			rows.Scan(&s, &svc, &env, &status, &ts)
			results = append(results, map[string]string{
				"secret":    s,
				"service":   svc,
				"env":       env,
				"status":    status,
				"timestamp": ts,
			})
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(results)
	})

	http.HandleFunc("/log", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", 405)
			return
		}

		secret := r.FormValue("secret")
		service := r.FormValue("service")
		env := r.FormValue("env")
		status := r.FormValue("status")

		if secret == "" || service == "" || env == "" || status == "" {
			http.Error(w, "Missing parameters", 400)
			return
		}

		LogSecretUsage(secret, service, env, status)
		w.Write([]byte("Logged"))
	})

	log.Println("Tracker API running at :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
