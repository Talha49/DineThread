"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { MenuItem } from "../MenuItem";
import { RouteBuilder } from "@/lib/layout-engines/RouteBuilder";

const LANE_PX = 34;

export function SubwayMenu({ groupedItems, setSelectedItem, isTVMode }) {
    const theme = useTheme();
    const palette = theme.config?.colors?.brand || { primary: "#4f46e5" };
    const stationRefs = useRef({});

    const stations = useMemo(() => new RouteBuilder(groupedItems).build(), [groupedItems]);
    const [activeId, setActiveId] = useState(stations[0]?.id);
    const activeStation = stations.find((s) => s.id === activeId) || stations[0];

    useEffect(() => {
        if (!stations.find((s) => s.id === activeId)) setActiveId(stations[0]?.id);
    }, [stations, activeId]);

    const handleSelectStation = (id) => {
        setActiveId(id);
        stationRefs.current[id]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    };

    return (
        <div className="pb-20">
            {/* The route line */}
            <div className="relative overflow-x-auto no-scrollbar px-8 pt-16 pb-10">
                <div
                    className="relative flex items-center"
                    style={{ minWidth: stations.length * 120, height: LANE_PX * 3 }}
                >
                    {/* Connecting track */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        <polyline
                            fill="none"
                            stroke={palette.primary}
                            strokeWidth="3"
                            strokeOpacity="0.25"
                            points={stations
                                .map((s, i) => `${i * 120 + 60},${LANE_PX * 1.5 - s.lane * LANE_PX}`)
                                .join(" ")}
                        />
                    </svg>

                    {stations.map((station, i) => {
                        const isActive = station.id === activeId;
                        return (
                            <button
                                key={station.id}
                                ref={(el) => (stationRefs.current[station.id] = el)}
                                onClick={() => handleSelectStation(station.id)}
                                className="absolute flex flex-col items-center gap-2 group"
                                style={{
                                    left: i * 120 + 60,
                                    top: LANE_PX * 1.5 - station.lane * LANE_PX,
                                    transform: "translate(-50%, -50%)",
                                }}
                                title={station.name}
                            >
                                <motion.div
                                    animate={{ scale: isActive ? 1.15 : 1 }}
                                    className={cn(
                                        "rounded-full flex items-center justify-center shadow-md border-4 transition-colors",
                                        isActive ? "border-white" : "border-white/70"
                                    )}
                                    style={{
                                        width: station.radius * 2 + (station.isInterchange ? 12 : 0),
                                        height: station.radius * 2 + (station.isInterchange ? 12 : 0),
                                        backgroundColor: isActive ? palette.primary : "#ffffff",
                                        boxShadow: isActive ? `0 8px 24px ${palette.primary}55` : "0 2px 8px rgba(0,0,0,0.08)",
                                    }}
                                >
                                    <span className="text-lg">{station.emoji}</span>
                                </motion.div>
                                <span
                                    className={cn(
                                        "absolute top-full mt-1 whitespace-nowrap text-[10px] font-black uppercase tracking-wider transition-opacity",
                                        isActive ? "opacity-100" : "opacity-50 group-hover:opacity-80"
                                    )}
                                    style={{ color: isActive ? palette.primary : theme.config?.colors?.text?.secondary }}
                                >
                                    {station.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Active station platform */}
            <div className="max-w-2xl mx-auto px-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStation?.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.35 }}
                    >
                        <div className="flex items-baseline gap-3 mb-8">
                            <h2
                                className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase"
                                style={{ color: theme.config?.colors?.text?.primary }}
                            >
                                {activeStation?.name}
                            </h2>
                            {activeStation?.isInterchange && (
                                <span
                                    className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full text-white"
                                    style={{ backgroundColor: palette.primary }}
                                >
                                    Hub Stop
                                </span>
                            )}
                        </div>

                        <div
                            className={cn(
                                "grid gap-4",
                                activeStation?.isInterchange ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                            )}
                        >
                            {activeStation?.items.map((item) => (
                                <div key={item._id} className="menu-item">
                                    <MenuItem item={item} theme={theme.config} onClick={() => setSelectedItem(item)} />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
