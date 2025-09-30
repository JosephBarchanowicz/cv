// src/App.jsx — remove MDX import, inline blog content, keep router and anchors
// Fix: the build failed because ./posts/karl.mdx didn’t exist. This version inlines the
// K.A.R.L. blog as JSX so the app runs without any MDX files or plugins. You can always
// switch back to MDX later.

import React, { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Github, Linkedin, MapPin, Cpu, Radio, Bot, SquareCode, FileDown, ArrowUp, ChevronLeft, Image as ImageIcon, ChevronRight } from "lucide-react";

// Place your image at public/joe.jpeg so it’s served at "/joe.jpeg"
const PROFILE_SRC = "/joe.jpeg";

// Optional blog images (drop files into /public and update names)
const KARL_IMAGES = [
    { src: "/karl-1.jpg", alt: "K.A.R.L. chassis mockup", caption: "First chassis mockup and wiring." },
    { src: "/karl-2.jpg", alt: "Sensor stack", caption: "IMU + encoder integration test." },
    { src: "/karl-3.jpg", alt: "Field test", caption: "Initial outdoor test loop." }
];

// Utility
function cx(...cls) { return cls.filter(Boolean).join(" "); }

// UI shims
function Button({ asChild = false, variant = "primary", size = "md", className = "", children, ...props }) {
    const base = "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm shadow-sm transition hover:opacity-90";
    const variants = { primary: "bg-sky-500 text-white", secondary: "bg-white/10 text-slate-100 border border-white/10" };
    const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm" };
    const cls = cx(base, variants[variant] || variants.primary, sizes[size] || sizes.md, className);
    if (asChild) return <span className={cls} {...props}>{children}</span>;
    return <button className={cls} {...props}>{children}</button>;
}
function Card({ className = "", children }) { return <div className={cx("rounded-2xl border p-0", className)}>{children}</div>; }
function CardHeader({ children }) { return <div className="px-5 pt-5">{children}</div>; }
function CardTitle({ className = "", children }) { return <h3 className={cx("text-lg font-semibold", className)}>{children}</h3>; }
function CardContent({ className = "", children }) { return <div className={cx("px-5 pb-5", className)}>{children}</div>; }
function Badge({ className = "", children }) { return <span className={cx("inline-flex items-center rounded-xl px-2.5 py-1 text-xs border", className)}>{children}</span>; }
function Input({ className = "", ...props }) { return <input className={cx("w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400", className)} {...props} />; }
function Textarea({ className = "", rows = 4, ...props }) { return <textarea rows={rows} className={cx("w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400", className)} {...props} />; }

// Helper for mailto link
export function buildMailto(to, name, email, message) {
    const subject = `Portfolio%20Inquiry%20from%20${encodeURIComponent(name || "")}`;
    const body = encodeURIComponent(`${message || ""}\n\nFrom: ${email || ""}`);
    return `mailto:${to}?subject=${subject}&body=${body}`;
}

// Data
const skills = [
    "Python", "C/C++", "ROS2 (rclpy)", "Embedded Linux", "RTOS", "CAN/SPI/I²C/UART",
    "RF (DMR/TETRA/P25)", "Systems Test & Validation", "Renewable energy systems", "Git & CI/CD",
    "Kinematics & Controls", "Networking (TCP/IP, MQTT, Modbus)"
];

const projects = [
    {
        title: "The K.A.R.L Project — Autonomous Rover",
        tagline: "Autonomous car • ROS2 • RTOS",
        description:
            "An autonomous rover platform built with ROS2 and RTOS, integrating sensors, control logic, and real-time validation for reliable navigation.",
        stack: ["ROS2", "RTOS", "C/C++", "Python"],
        links: [
            { label: "Code", href: "https://github.com/JosephBarchanowicz/The-KARL-Project" },
            { label: "Blog", href: "/blog/karl" }
        ]
    },
    {
        title: "Motor Driver Control System",
        tagline: "Motor Control • MicroPython",
        description: "This project uses a Raspberry Pi Pico running MicroPython to control two TT-style DC motors through an L298N motor driver board. " +
            "The Pico’s GPIO pins send logic signals and PWM to drive the motors forward, backward, and at variable speeds. " +
            "It’s a simple, low-cost way to learn motor control and a great starting point for robotics builds, DIY vehicles, or motion-based projects.",
        stack: ["MicroPython", "Raspberry Pi Pico"],
        links: [{ label: "Code", href: "https://github.com/JosephBarchanowicz/Motor_Driver_Python/tree/main/motor_driver_code" }]
    }
];

// --- Experience data ---
const experience = [
    {
        company: "Defense Systems Integrator",
        role: "Electronics & RF Engineer",
        location: "Southern California",
        period: "2021 – 2025",
        highlights: [
            "Designed and validated RF subsystems (DMR/TETRA/P25) and mission‑critical comms links.",
            "Built HIL/SIL-style test benches; automated bring-up with Python and C++ tools.",
            "Developed firmware utilities for CAN/SPI/I²C/UART; authored SOPs and mentoring guides."
        ],
        stack: ["Python", "C/C++", "RF", "CAN/SPI/I²C/UART", "Linux"]
    },
    {
        company: "Industrial Automation OEM",
        role: "Embedded Systems Engineer",
        location: "Southern California",
        period: "2018 – 2021",
        highlights: [
            "Shipped embedded Linux/RTOS control modules for factory equipment and robotics cells.",
            "Implemented CI/CD for firmware; added unit + hardware-in-the-loop regression suites.",
            "Created field diagnostics and telemetry pipelines for faster root-cause analysis."
        ],
        stack: ["Embedded Linux", "RTOS", "Git & CI/CD", "Modbus/TCP", "ROS2 (rclpy)"]
    },
    {
        company: "Renewable Energy Startup",
        role: "Systems Test & Validation Engineer",
        location: "Southern California",
        period: "2015 – 2018",
        highlights: [
            "Developed inverter and BMS validation rigs with sensor emulation and safety interlocks.",
            "Automated endurance and thermal tests; produced traceable reports for certifications.",
            "Collaborated cross-functionally to harden designs for field reliability."
        ],
        stack: ["Python", "DAQ", "Safety Systems", "Networking", "Data Analysis"]
    }
];

// ------------------------- Router Shell -------------------------
function AppShell({ children }) {
    const location = useLocation();
    // Smooth scroll to #fragment links within a page
    useEffect(() => {
        if (location.hash && location.pathname === "/") {
            const el = document.querySelector(location.hash);
            if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 0);
        }
    }, [location]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
            <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
                <div className="mx-auto max-w-6xl px-4">
                    <nav className="flex items-center justify-between py-4">
                        <NavLink to="/" className="flex items-center gap-2 font-semibold tracking-tight">
                            <Bot className="h-5 w-5" />
                            <span>RF • Robotics & Embedded</span>
                        </NavLink>
                        <div className="hidden gap-6 md:flex">
                            {location.pathname === "/" ? (
                                ["About","Projects","Experience","Skills","Contact"].map((label) => (
                                    <a key={label} href={`#${label.toLowerCase()}`} className="text-sm hover:opacity-80">{label}</a>
                                ))
                            ) : (
                                <NavLink to="/" className="text-sm hover:opacity-80 flex items-center"><ChevronLeft className="mr-1 h-4 w-4"/>Back</NavLink>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <a href="/Joe_Barchanowicz_Resume.pdf" className="hidden md:inline-flex"><Button size="sm" variant="secondary"><FileDown className="mr-2 h-4 w-4"/>Resume</Button></a>
                            <a href="https://github.com/JosephBarchanowicz?tab=repositories" className="p-2 rounded-xl hover:bg-white/5" aria-label="GitHub"><Github /></a>
                            <a href="https://www.linkedin.com/in/joe-barchanowicz/" className="p-2 rounded-xl hover:bg-white/5" aria-label="LinkedIn"><Linkedin /></a>
                        </div>
                    </nav>
                </div>
            </header>

            {children}

            <footer className="border-t border-white/10 mt-10">
                <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-400">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <p>© {new Date().getFullYear()} Joe Barchanowicz</p>
                        <div className="flex items-center gap-2">
                            <span className="opacity-80">Built with</span>
                            <span className="inline-flex items-center gap-1">React • Tailwind (CDN) • framer-motion</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// ------------------------- Pages -------------------------
function HomePage() {
    return (
        <>
            {/* Hero */}
            <section id="home" className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_80%_-10%,rgba(56,189,248,0.15),transparent),radial-gradient(40rem_20rem_at_0%_20%,rgba(34,197,94,0.1),transparent)]" />
                <div className="mx-auto max-w-6xl px-4 py-20 md:py-28 grid md:grid-cols-12 gap-10 items-center">
                    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="md:col-span-7 flex flex-col items-center text-center">
                        <h1 className="text-3xl md:text-5xl font-semibold leading-tight">Maker at heart, Engineer by trade.</h1>
                        <p className="mt-4 md:text-lg text-slate-300">I’m Joe Barchanowicz — an electronics and RF engineer who is also a passionate maker and coder. I love building things, experimenting with hardware and software, and creating systems that are both functional and reliable. I have worked across defense, industrial, and renewable energy fields, applying my skills to diverse and challenging environments.</p>
                        <div className="mt-6 flex gap-3 flex-wrap justify-center">
                            <a className="inline-block" href="#projects"><Button asChild><span>View Projects</span></Button></a>
                            <a className="inline-block" href="#contact"><Button variant="secondary" asChild><span className="inline-flex items-center"><Mail className="mr-2 h-4 w-4"/>Get in touch</span></Button></a>
                        </div>
                        <div className="mt-6 text-sm text-slate-400 flex gap-3 flex-wrap justify-center">
                            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4"/>Southern California</span>
                            <span className="inline-flex items-center gap-1"><Radio className="h-4 w-4"/>Mission-critical comms</span>
                            <span className="inline-flex items-center gap-1"><Cpu className="h-4 w-4"/>Renewable energy systems</span>
                        </div>
                    </motion.div>
                    <motion.div initial={{opacity:0,scale:0.98}} animate={{opacity:1,scale:1}} transition={{duration:0.6,delay:0.1}} className="md:col-span-5 flex flex-col items-center">
                        <img src={PROFILE_SRC} alt="Profile" className="rounded-full w-48 h-48 object-cover shadow-lg border-4 border-white/10" />
                        <Card className="bg-white/5 border-white/10 mt-6 w-full">
                            <CardHeader><CardTitle className="flex items-center gap-2"><SquareCode className="h-5 w-5"/>Quick Links</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="space-y-3 text-sm">
                                    <li><a className="hover:underline" href="https://github.com/JosephBarchanowicz/Python-Practice">GitHub • Code samples</a></li>
                                    <li><a className="hover:underline" href="/Joe_Barchanowicz_Resume.pdf">Resume (PDF)</a></li>
                                    <li><a className="hover:underline" href="#experience">Recent experience</a></li>
                                    <li><a className="hover:underline" href="#skills">Core skills</a></li>
                                    <li><NavLink className="hover:underline" to="/blog/karl">K.A.R.L. Project Blog</NavLink></li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* About */}
            <section id="about" className="relative border-t border-white/10">
                <div className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(80%_60%_at_50%_0%,black,transparent)] bg-[radial-gradient(55rem_30rem_at_20%_-10%,rgba(56,189,248,0.18),transparent),radial-gradient(45rem_25rem_at_90%_20%,rgba(34,197,94,0.12),transparent)]" />
                <div className="relative mx-auto max-w-6xl px-4 py-20 grid md:grid-cols-12 gap-8">
                    <div className="md:col-span-12"><h2 className="text-3xl font-semibold mb-2">About</h2></div>
                    <div className="md:col-span-5">
                        <p className="text-lg leading-snug text-slate-200">
                            I’m Joe Barchanowicz — an electronics and RF engineer who is also a passionate maker and coder. I love building things, experimenting with hardware and software, and creating systems that are both functional and reliable. I have worked across defense, industrial, and renewable energy fields, applying my skills to diverse and challenging environments.
                        </p>
                    </div>
                    <div className="md:col-span-7">
                        <ul className="grid gap-2 text-base text-slate-200 leading-snug">
                            <li>• Experienced in building and refining test harnesses and firmware tools for CAN/SPI/I²C/UART buses — I enjoy tackling complex technical problems and turning them into practical solutions.</li>
                            <li>• Naturally curious and hands-on — I enjoy taking things apart, understanding how they work, and pushing myself to create better systems.</li>
                            <li>• Driven by a maker mindset: from robots to STM32/Arduino/Pico projects, I thrive on experimenting and building practical, working solutions.</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Projects */}
            <section id="projects" className="mx-auto max-w-6xl px-4 py-16">
                <div className="mb-8 flex items-end justify-between">
                    <h2 className="text-2xl font-semibold">Projects</h2>
                    <a href="https://github.com/JosephBarchanowicz?tab=repositories" className="text-sm opacity-80 hover:opacity-100">See all →</a>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    {projects.map((p) => (
                        <motion.div key={p.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <Card className="h-full bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-lg">{p.title}</CardTitle>
                                    <p className="text-sm text-slate-400">{p.tagline}</p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-slate-300">{p.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {p.stack.map((s) => (<Badge key={s} className="bg-white/10 text-slate-200 border-white/10">{s}</Badge>))}
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {p.links.map((l) => (
                                            l.href.startsWith("/")
                                                ? <Button asChild key={l.href} size="sm" variant="secondary"><NavLink to={l.href}>{l.label}</NavLink></Button>
                                                : <Button asChild key={l.href} size="sm" variant="secondary"><a href={l.href} target="_blank" rel="noreferrer">{l.label}</a></Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Experience */}
            <section id="experience" className="mx-auto max-w-6xl px-4 py-16">
                <h2 className="text-2xl font-semibold mb-6">Experience</h2>
                <div className="grid gap-6">
                    {experience.map((job) => (
                        <Card key={job.company + job.period} className="bg-white/5 border-white/10">
                            <CardHeader>
                                <div className="flex flex-wrap items-baseline justify-between gap-3">
                                    <CardTitle className="text-xl">{job.role}</CardTitle>
                                    <span className="text-sm text-slate-400">{job.period}</span>
                                </div>
                                <p className="text-slate-300 mt-1">{job.company} • {job.location}</p>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-5 space-y-2 text-slate-200">
                                    {job.highlights.map((h, i) => (<li key={i}>{h}</li>))}
                                </ul>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {job.stack.map((t) => (<Badge key={t} className="bg-white/10 text-slate-200 border-white/10">{t}</Badge>))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Skills */}
            <section id="skills" className="mx-auto max-w-6xl px-4 py-16">
                <h2 className="text-2xl font-semibold mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">{skills.map((s) => (<Badge key={s} className="bg-white/10 text-slate-200 border-white/10">{s}</Badge>))}</div>
            </section>

            {/* Contact */}
            <section id="contact" className="mx-auto max-w-6xl px-4 py-16">
                <div className="grid gap-8 md:grid-cols-12 items-start">
                    <div className="md:col-span-6">
                        <h2 className="text-2xl font-semibold">Contact</h2>
                        <p className="mt-3 text-slate-300">Let’s talk about robotics, validation, or collaboration. I’m open to SoCal roles and impactful projects.</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Button asChild variant="secondary"><a href="mailto:joe.r.barchanowicz@gmail.com"><Mail className="mr-2 h-4 w-4"/>joe.r.barchanowicz@gmail.com</a></Button>
                            <Button asChild variant="secondary"><a href="https://github.com/JosephBarchanowicz?tab=repositories" target="_blank" rel="noreferrer"><Github className="mr-2 h-4 w-4"/>GitHub</a></Button>
                            <Button asChild variant="secondary"><a href="https://www.linkedin.com/in/joe-barchanowicz/" target="_blank" rel="noreferrer"><Linkedin className="mr-2 h-4 w-4"/>LinkedIn</a></Button>
                        </div>
                    </div>
                    <div className="md:col-span-6">
                        <ContactForm />
                    </div>
                </div>
            </section>

            <BackToTop />
        </>
    );
}

function BlogKarl() {
    const navigate = useNavigate();
    return (
        <section id="blog-karl" className="relative">
            {/* Sticky breadcrumb */}
            <div className="sticky top-12 z-40 border-b border-white/10 bg-slate-900/70 backdrop-blur">
                <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
                    <div className="text-sm text-slate-300 flex items-center gap-2">
                        <NavLink to="/" className="hover:underline flex items-center"><ChevronLeft className="mr-1 h-4 w-4"/>Back to Home</NavLink>
                        <span className="opacity-60">/</span>
                        <span>K.A.R.L. Project Blog</span>
                    </div>
                    <a href="#top" onClick={(e)=>{e.preventDefault(); window.scrollTo({top:0,behavior:'smooth'});}} className="text-sm hover:underline">Top</a>
                </div>
            </div>

            <div className="pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(70%_50%_at_50%_0%,black,transparent)] bg-[radial-gradient(40rem_20rem_at_20%_-10%,rgba(56,189,248,0.15),transparent),radial-gradient(40rem_20rem_at_80%_10%,rgba(34,197,94,0.1),transparent)]" />
            <div className="relative mx-auto max-w-4xl px-4 py-16">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <h2 className="text-3xl font-semibold tracking-tight">K.A.R.L. Project Blog</h2>
                    <NavLink to="/" className="text-sm text-sky-300 hover:underline">← Back to Home</NavLink>
                </div>

                {/* Post meta */}
                <div className="text-sm text-slate-400 mb-8">
                    <span>Autonomous Rover • ROS2 • RTOS</span>
                    <span className="mx-2">•</span>
                    <span>Updated {new Date().toLocaleDateString()}</span>
                </div>

                {/* Gallery */}
                <div className="mb-8">
                    <div className="mb-3 flex items-center gap-2 text-slate-300"><ImageIcon className="h-4 w-4"/>Project Gallery</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {KARL_IMAGES.map((img) => (
                            <figure key={img.src} className="rounded-xl overflow-hidden border border-white/10 bg-white/5">
                                <img src={img.src} alt={img.alt} className="w-full h-56 object-cover" />
                                <figcaption className="p-3 text-sm text-slate-300">{img.caption}</figcaption>
                            </figure>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-400">Put your images in <code>/public</code> with the names above, or update the <code>KARL_IMAGES</code> array.</p>
                </div>

                {/* Table of contents */}
                <div className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="text-base font-semibold mb-3">Contents</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-300">
                        <li><a className="hover:underline" href="#karl-intro">Overview & Goals</a></li>
                        <li><a className="hover:underline" href="#karl-hardware">Hardware Stack</a></li>
                        <li><a className="hover:underline" href="#karl-software">Software Architecture</a></li>
                        <li><a className="hover:underline" href="#karl-validation">Validation & Testing</a></li>
                        <li><a className="hover:underline" href="#karl-next">What’s Next</a></li>
                    </ol>
                </div>

                {/* Sections (inline JSX instead of MDX) */}
                <article className="prose prose-invert max-w-none">
                    <h3 id="karl-intro" className="text-xl font-semibold mb-3">Overview & Goals</h3>
                    <p className="text-slate-300 leading-relaxed">
                        K.A.R.L. is my autonomous rover platform focused on reliable, field-friendly autonomy. The goal is to combine a real-time control layer with ROS2-based perception and planning, while keeping the system debuggable and maintainable for rapid iteration.
                    </p>

                    <h3 id="karl-hardware" className="text-xl font-semibold mt-10 mb-3">Hardware Stack</h3>
                    <ul className="list-disc pl-6 space-y-2 text-slate-300">
                        <li>Chassis & Drive: differential drive base with encoders</li>
                        <li>Sensing: IMU, wheel encoders, optional LIDAR/depth camera</li>
                        <li>Compute: SBC for ROS2 nodes + microcontroller for RTOS control loop</li>
                        <li>I/O & Buses: CAN/SPI/I²C/UART as required</li>
                        <li>Power: regulated rails with monitoring</li>
                    </ul>

                    <h3 id="karl-software" className="text-xl font-semibold mt-10 mb-3">Software Architecture</h3>
                    <p className="text-slate-300 leading-relaxed">
                        A layered approach: low-level motor control on RTOS (deterministic loop), with ROS2 handling node graph, transforms, sensor fusion, and higher-level behaviors. Telemetry and parameters are exposed over ROS2 topics/services for tuning.
                    </p>
                    <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 text-xs">
<span className="text-slate-300">// Example: node graph sketch</span>{`
/robot_state_pub   -> tf, odom
/imu_driver        -> /imu/data
/encoder_driver    -> /wheel/odom
/controller_node   -> /cmd_vel (RTOS bridge)
/planner_node      -> target waypoints
`}</pre>

                    <h3 id="karl-validation" className="text-xl font-semibold mt-10 mb-3">Validation & Testing</h3>
                    <ul className="list-disc pl-6 space-y-2 text-slate-300">
                        <li>Bench tests for motor drivers and encoder counts (HIL-style mocks)</li>
                        <li>ROS2 bag recording & playback for repeatable regression runs</li>
                        <li>Parameterized PID tuning sessions with logged metrics</li>
                    </ul>

                    <h3 id="karl-next" className="text-xl font-semibold mt-10 mb-3">What’s Next</h3>
                    <p className="text-slate-300 leading-relaxed">
                        Integrate a LIDAR pipeline, add waypoint following with obstacle avoidance, and publish a setup guide. I’ll also share wiring diagrams and STL files for reusable mounts.
                    </p>
                </article>

                {/* Prev / Next nav */}
                <div className="mt-10 flex items-center justify-between">
                    <Button variant="secondary" asChild>
                        <NavLink to="/" className="inline-flex items-center"><ChevronLeft className="mr-2 h-4 w-4"/> Previous: Home</NavLink>
                    </Button>
                    <Button variant="secondary" className="opacity-60 cursor-not-allowed" title="No next post yet">
                        Next Post <ChevronRight className="ml-2 h-4 w-4"/>
                    </Button>
                </div>

                {/* Footer cta */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <a href="https://github.com/JosephBarchanowicz/Python-Practice" className="text-sm underline">Source code</a>
                    <span className="opacity-60">•</span>
                    <a href="#contact" onClick={(e)=>{e.preventDefault(); navigate("/"); setTimeout(()=>{document.getElementById("contact")?.scrollIntoView({behavior:'smooth'});}, 0);}} className="text-sm underline">Contact me</a>
                </div>
            </div>

            <BackToTop />
        </section>
    );
}

function ContactForm() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const onSubmit = (e) => {
        e.preventDefault();
        const mailto = buildMailto("joe.r.barchanowicz@gmail.com", form.name, form.email, form.message);
        window.location.href = mailto;
    };
    return (
        <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle>Send a message</CardTitle></CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-3">
                    <Input name="name" placeholder="Your name" value={form.name} onChange={onChange} />
                    <Input type="email" name="email" placeholder="Your email" value={form.email} onChange={onChange} />
                    <Textarea name="message" placeholder="What would you like to build together?" value={form.message} onChange={onChange} rows={5} />
                    <Button type="submit" className="w-full">Send</Button>
                </form>
            </CardContent>
        </Card>
    );
}

function BackToTop() {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const onScroll = () => setShow(window.scrollY > 400);
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    if (!show) return null;
    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 rounded-full border border-white/10 bg-white/10 p-3 backdrop-blur hover:bg-white/20"
            aria-label="Back to top"
        >
            <ArrowUp className="h-5 w-5" />
        </button>
    );
}

// ------------------------- App Root -------------------------
export default function App() {
    return (
        <Router>
            <AppShell>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/blog/karl" element={<BlogKarl />} />
                    <Route path="*" element={<HomePage />} />
                </Routes>
            </AppShell>
        </Router>
    );
}

