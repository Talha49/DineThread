export const AuthService = {
    async signup(data) {
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const json = await res.json();
        
        if (!res.ok) {
            throw new Error(json.message || "Registration failed");
        }
        
        return json;
    }
};
