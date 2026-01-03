package main

import "log"

func LogSecretUsage(secretName, service, env, status string) {
    stmt, err := DB.Prepare(`INSERT INTO secrets(secret_name, service, env, status) VALUES (?, ?, ?, ?)`)
    if err != nil {
        log.Println("Failed to prepare statement:", err)
        return
    }
    defer func() {
        if stmt != nil {
            stmt.Close()
        }
    }()

    _, err = stmt.Exec(secretName, service, env, status)
    if err != nil {
        log.Println("Failed to exec statement:", err)
        return
    }

    log.Printf("Logged secret: %s used by %s in %s [%s]\n", secretName, service, env, status)
}
