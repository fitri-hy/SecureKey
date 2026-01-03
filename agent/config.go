package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
)

type Policy struct {
	SecretName      string   `json:"secret_name"`
	AllowedServices []string `json:"allowed_services"`
	AllowedEnvs     []string `json:"allowed_envs"`
}

var Policies []Policy

func LoadPolicies(path string) error {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return err
	}
	err = json.Unmarshal(data, &Policies)
	if err != nil {
		return err
	}
	log.Printf("Loaded %d policies\n", len(Policies))
	return nil
}
