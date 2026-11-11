"use client";

import { useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const ATMOSPHERE_CONFIGS = {
    snow: {
        particles: {
            number: { value: 120, density: { enable: true } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: { min: 0.2, max: 0.8 }, animation: { enable: true, speed: 1 } },
            size: { value: { min: 1, max: 4 } },
            move: {
                enable: true,
                speed: 2.5,
                direction: "bottom",
                straight: false,
            },
            wobble: { enable: true, distance: 10, speed: 10 }
        },
    },
    stars: {
        particles: {
            number: { value: 200, density: { enable: true } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: {
                value: { min: 0.3, max: 1 },
                animation: { enable: true, speed: 2, sync: false }
            },
            size: { value: { min: 1, max: 2.5 } },
            move: {
                enable: true,
                speed: { min: 0.1, max: 0.5 },
                direction: "none",
                random: true,
                straight: false,
                outModes: { default: "out" }
            },
        },
    },
    bubbles: {
        particles: {
            number: { value: 60, density: { enable: true } },
            color: { value: "currentColor" },
            shape: { type: "circle" },
            opacity: { value: 0.4 },
            size: { value: { min: 4, max: 12 } },
            move: {
                enable: true,
                speed: 1.5,
                direction: "top",
                straight: false,
            },
        }
    },
    rain: {
        particles: {
            number: { value: 200, density: { enable: true } },
            color: { value: "#ffffff" },
            shape: { type: "line" },
            opacity: { value: 0.3 },
            size: { value: { min: 1, max: 20 } },
            move: {
                enable: true,
                speed: 15,
                direction: "bottom",
                straight: true,
                outModes: { default: "out" }
            },
        }
    }
};

import { useTheme } from "@/contexts/ThemeContext";

export function AtmosphereStage({ children }) {
    const theme = useTheme();
    const atmosphere = theme.config?.effects?.atmosphere || theme.config?.atmosphere || { active: 'none', intensity: 0 };
    const brandColor = theme.config?.colors?.brand?.primary;

    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const config = useMemo(() => {
        if (!atmosphere?.active || atmosphere.active === "none") return null;

        let base = ATMOSPHERE_CONFIGS[atmosphere.active] || null;
        if (!base) return null;

        // Deep clone and customize
        const finalConfig = JSON.parse(JSON.stringify(base));
        if (atmosphere.active === "bubbles") {
            finalConfig.particles.color.value = brandColor || "#4f46e5";
        }

        // Apply intensity
        const intensity = (atmosphere.intensity || 50) / 50;
        finalConfig.particles.number.value = Math.floor(finalConfig.particles.number.value * intensity);

        return finalConfig;
    }, [atmosphere?.active, atmosphere?.intensity, brandColor]);

    return (
        <div className="relative min-h-screen w-full">
            {/* Cinematic Background Contrast Layer (for Snow/Stars on White) */}
            {init && config && (atmosphere.active === "snow" || atmosphere.active === "stars") && (
                <div className="fixed inset-0 z-[0] pointer-events-none bg-gradient-to-b from-zinc-950/10 via-transparent to-zinc-950/20 mix-blend-multiply transition-opacity duration-1000" />
            )}

            {init && config && (
                <div
                    key={atmosphere.active}
                    className="fixed inset-0 z-[1] pointer-events-none w-full h-full"
                >
                    <Particles
                        id={`atmosphere-${atmosphere.active}`}
                        options={{
                            fullScreen: { enable: false },
                            ...config
                        }}
                        className="w-full h-full"
                    />
                </div>
            )}
            <div className="relative z-10 w-full min-h-screen">
                {children}
            </div>
        </div>
    );
}
