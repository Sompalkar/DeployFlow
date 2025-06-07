"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, Globe, Shield, GitBranch, Rocket, CheckCircle, Star, Code, Layers, Gauge } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useState, useEffect } from "react"

const AnimatedCounter = ({ end, duration = 2000 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0)
  const [ref, inView] = useInView({ triggerOnce: true })

  useEffect(() => {
    if (inView) {
      let startTime: number
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)
        setCount(Math.floor(progress * end))
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)
    }
  }, [inView, end, duration])

  return <span ref={ref}>{count}</span>
}

const FloatingCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DeployFlow
            </span>
          </motion.div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="#docs" className="text-gray-600 hover:text-gray-900 transition-colors">
              Docs
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
            <Zap className="w-3 h-3 mr-1" />
            Zero Configuration Deployments
          </Badge>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Deploy React Apps
          <br />
          <motion.span
            className="text-blue-600"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Instantly
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          The fastest way to deploy your React applications. Connect your Git repository and deploy with zero
          configuration. Automatic HTTPS, global CDN, and instant rollbacks included.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Link href="/auth/register">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 shadow-lg"
              >
                Start Deploying
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </Link>
          <Link href="/dashboard">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-2">
                View Dashboard
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Animated Stats */}
        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          initial={{ y: 50, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="text-center p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              <AnimatedCounter end={99} />%
            </div>
            <div className="text-gray-600 font-medium">Uptime</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {"<"}
              <AnimatedCounter end={30} />s
            </div>
            <div className="text-gray-600 font-medium">Deploy Time</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg">
            <div className="text-4xl font-bold text-green-600 mb-2">
              <AnimatedCounter end={50} />+
            </div>
            <div className="text-gray-600 font-medium">Regions</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              <AnimatedCounter end={10000} />+
            </div>
            <div className="text-gray-600 font-medium">Deployments</div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Everything you need to deploy
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for developers who want to focus on building, not configuring infrastructure.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: GitBranch,
                title: "Git Integration",
                description:
                  "Connect your GitHub, GitLab, or Bitbucket repository and deploy automatically on every push.",
                color: "blue",
                delay: 0,
              },
              {
                icon: Globe,
                title: "Global CDN",
                description:
                  "Your apps are served from our global edge network for lightning-fast performance worldwide.",
                color: "green",
                delay: 0.1,
              },
              {
                icon: Shield,
                title: "Automatic HTTPS",
                description: "SSL certificates are automatically provisioned and renewed for all your deployments.",
                color: "purple",
                delay: 0.2,
              },
              {
                icon: Zap,
                title: "Zero Config",
                description:
                  "No configuration files needed. We automatically detect your framework and build settings.",
                color: "orange",
                delay: 0.3,
              },
              {
                icon: Rocket,
                title: "Instant Rollbacks",
                description: "Made a mistake? Roll back to any previous deployment with a single click.",
                color: "red",
                delay: 0.4,
              },
              {
                icon: CheckCircle,
                title: "Preview Deployments",
                description: "Every pull request gets its own deployment URL for easy testing and collaboration.",
                color: "teal",
                delay: 0.5,
              },
            ].map((feature, index) => (
              <FloatingCard key={index} delay={feature.delay}>
                <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 h-full bg-white/80 backdrop-blur-sm group">
                  <CardHeader className="text-center">
                    <motion.div
                      className={`w-16 h-16 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className={`w-8 h-8 text-${feature.color}-600`} />
                    </motion.div>
                    <CardTitle className="text-xl mb-3 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent">
              How it works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Deploy your React app in three simple steps</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                icon: Code,
                title: "Connect Repository",
                description: "Link your GitHub, GitLab, or Bitbucket repository with a single click.",
              },
              {
                step: "02",
                icon: Layers,
                title: "Auto Build",
                description: "We automatically detect your framework and build your application.",
              },
              {
                step: "03",
                icon: Gauge,
                title: "Go Live",
                description: "Your app is deployed globally with HTTPS and CDN in seconds.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Trusted by developers worldwide</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  quote: "DeployFlow made our deployment process 10x faster. Amazing platform!",
                  author: "Sarah Chen",
                  role: "Frontend Developer",
                },
                {
                  quote: "Zero configuration, maximum performance. Exactly what we needed.",
                  author: "Mike Rodriguez",
                  role: "Tech Lead",
                },
                {
                  quote: "The best deployment platform I've ever used. Highly recommended!",
                  author: "Alex Thompson",
                  role: "Full Stack Developer",
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                >
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: 180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{ delay: i * 0.1 + index * 0.2, duration: 0.3 }}
                        viewport={{ once: true }}
                      >
                        <Star className="w-6 h-6 text-yellow-400 fill-current" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-blue-100 text-lg mb-4">"{testimonial.quote}"</p>
                  <p className="text-blue-200 font-medium">{testimonial.author}</p>
                  <p className="text-blue-300 text-sm">{testimonial.role}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
          <motion.div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
            animate={{
              backgroundPosition: ["0px 0px", "60px 60px"],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to deploy your first app?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who trust DeployFlow for their React deployments.
            </p>
            <Link href="/auth/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6 shadow-lg">
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">DeployFlow</span>
              </div>
              <p className="text-gray-400">The fastest way to deploy React applications with zero configuration.</p>
            </motion.div>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </motion.div>
          </div>
          <motion.div
            className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p>&copy; 2024 DeployFlow. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}
