"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  GitBranch,
  Globe,
  Clock,
  ExternalLink,
  Settings,
  Trash2,
  Play,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useRecoilState, useRecoilValue } from "recoil";
import { authState, projectsState } from "@/lib/atoms";
import { projectApi } from "@/lib/api/projects";
import { deploymentApi } from "@/lib/api/deployments";
import DashboardLayout from "@/components/dashboard-layout";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/front/hooks/use-toast";

export default function DashboardPage() {
  const auth = useRecoilValue(authState);
  const [projects, setProjects] = useRecoilState(projectsState);
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    name: "",
    repoUrl: "",
    buildCommand: "npm run build",
    outputDir: "dist",
  });
  const [deployingProjects, setDeployingProjects] = useState<Set<string>>(
    new Set()
  );
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectApi.getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to load projects:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load projects. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await projectApi.createProject(newProjectData);
      setProjects((prev) => [...prev, response.data]);
      setShowNewProject(false);
      setNewProjectData({
        name: "",
        repoUrl: "",
        buildCommand: "npm run build",
        outputDir: "dist",
      });
      toast({
        title: "Success!",
        description: "Project created successfully.",
      });
    } catch (error: any) {
      console.error("Failed to create project:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create project.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async (projectId: string) => {
    setDeployingProjects((prev) => new Set(prev).add(projectId));

    try {
      await deploymentApi.createDeployment(projectId);
      toast({
        title: "Deployment started!",
        description:
          "Your project is being deployed. This may take a few minutes.",
      });
      // Refresh projects to get updated status
      loadProjects();
    } catch (error: any) {
      console.error("Failed to deploy:", error);
      toast({
        variant: "destructive",
        title: "Deployment failed",
        description:
          error.response?.data?.message || "Failed to start deployment.",
      });
    } finally {
      setDeployingProjects((prev) => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "deployed":
        return "bg-green-100 text-green-800 border-green-200";
      case "building":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "deployed":
        return <CheckCircle2 className="w-3 h-3" />;
      case "building":
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  if (loading && projects.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Projects
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and deploy your React applications
            </p>
          </div>
          <Button
            onClick={() => setShowNewProject(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </motion.div>

        {/* New Project Form */}
        <AnimatePresence>
          {showNewProject && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-blue-600" />
                    Create New Project
                  </CardTitle>
                  <CardDescription>
                    Connect your Git repository to start deploying
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateProject} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                          id="name"
                          placeholder="my-react-app"
                          value={newProjectData.name}
                          onChange={(e) =>
                            setNewProjectData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          required
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="repoUrl">Repository URL</Label>
                        <Input
                          id="repoUrl"
                          placeholder="https://github.com/username/repo"
                          value={newProjectData.repoUrl}
                          onChange={(e) =>
                            setNewProjectData((prev) => ({
                              ...prev,
                              repoUrl: e.target.value,
                            }))
                          }
                          required
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="buildCommand">Build Command</Label>
                        <Input
                          id="buildCommand"
                          placeholder="npm run build"
                          value={newProjectData.buildCommand}
                          onChange={(e) =>
                            setNewProjectData((prev) => ({
                              ...prev,
                              buildCommand: e.target.value,
                            }))
                          }
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="outputDir">Output Directory</Label>
                        <Input
                          id="outputDir"
                          placeholder="dist"
                          value={newProjectData.outputDir}
                          onChange={(e) =>
                            setNewProjectData((prev) => ({
                              ...prev,
                              outputDir: e.target.value,
                            }))
                          }
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Project"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewProject(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="text-center py-12 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent>
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <GitBranch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first project to start deploying React
                  applications
                </p>
                <Button
                  onClick={() => setShowNewProject(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="h-full"
                >
                  <Card className="hover:shadow-2xl transition-all duration-300 h-full shadow-lg border-0 bg-white/80 backdrop-blur-sm group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {project.name}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${getStatusColor(
                            project.status
                          )} flex items-center gap-1`}
                        >
                          {getStatusIcon(project.status)}
                          {project.status}
                        </Badge>
                        {project.lastDeployment && (
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(
                              project.lastDeployment
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <GitBranch className="w-4 h-4" />
                        <span className="truncate">{project.repoUrl}</span>
                      </div>

                      {project.deploymentUrl && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="w-4 h-4 text-green-600" />
                          <a
                            href={project.deploymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate flex items-center gap-1"
                          >
                            {project.deploymentUrl}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      <Separator />

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleDeploy(project.id)}
                          disabled={
                            project.status === "building" ||
                            deployingProjects.has(project.id)
                          }
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {project.status === "building" ||
                          deployingProjects.has(project.id) ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Building...
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              Deploy
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-gray-50"
                        >
                          <Settings className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
