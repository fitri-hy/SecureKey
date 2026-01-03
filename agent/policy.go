package main

func CheckPolicy(secret, service, env string) bool {
	for _, p := range Policies {
		if p.SecretName == secret {
			if contains(p.AllowedServices, service) && contains(p.AllowedEnvs, env) {
				return true
			}
		}
	}
	return false
}
