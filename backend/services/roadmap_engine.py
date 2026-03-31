"""
VidyaMitra — Production-Grade Hybrid Learning Roadmap Engine
Architecture: Data Layer → Logic Layer → AI Layer (enhance only)
"""

import hashlib
import json
import math
import os
import re
from collections import defaultdict, deque
from typing import Optional

from dotenv import load_dotenv
from openai import OpenAI

from services.domain_knowledge import get_domain_knowledge

load_dotenv()

# ═══════════════════════════════════════════════════════════════════
# AI CLIENT
# ═══════════════════════════════════════════════════════════════════

_client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)
AI_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"

# ═══════════════════════════════════════════════════════════════════
# 1. ENHANCED SKILL GRAPH
# category: core | framework | tool | advanced
# complexity: 1 (trivial) – 5 (very hard)
# ═══════════════════════════════════════════════════════════════════

SKILL_GRAPH: dict[str, dict] = {
    # ── Foundational / Core ──
    "HTML":                {"prerequisites": [],                        "complexity": 1, "category": "core"},
    "CSS":                 {"prerequisites": ["HTML"],                  "complexity": 2, "category": "core"},
    "JavaScript":          {"prerequisites": [],                        "complexity": 3, "category": "core"},
    "TypeScript":          {"prerequisites": ["JavaScript"],            "complexity": 3, "category": "core"},
    "Python":              {"prerequisites": [],                        "complexity": 2, "category": "core"},
    "SQL":                 {"prerequisites": [],                        "complexity": 2, "category": "core"},
    "Git":                 {"prerequisites": [],                        "complexity": 1, "category": "tool"},
    "Linux":               {"prerequisites": [],                        "complexity": 2, "category": "tool"},
    "Scripting":           {"prerequisites": ["Linux"],                 "complexity": 2, "category": "tool"},

    # ── Frontend Frameworks ──
    "React":               {"prerequisites": ["JavaScript"],            "complexity": 3, "category": "framework"},
    "Next.js":             {"prerequisites": ["React"],                 "complexity": 4, "category": "framework"},
    "Responsive Design":   {"prerequisites": ["CSS"],                   "complexity": 2, "category": "core"},
    "Tailwind CSS":        {"prerequisites": ["CSS"],                   "complexity": 2, "category": "tool"},
    "Webpack/Vite":        {"prerequisites": ["JavaScript"],            "complexity": 2, "category": "tool"},

    # ── Backend / APIs ──
    "Node.js":             {"prerequisites": ["JavaScript"],            "complexity": 3, "category": "framework"},
    "REST APIs":           {"prerequisites": ["JavaScript"],            "complexity": 2, "category": "core"},
    "GraphQL":             {"prerequisites": ["REST APIs"],             "complexity": 3, "category": "advanced"},
    "Authentication":      {"prerequisites": ["REST APIs"],             "complexity": 3, "category": "core"},
    "Database Design":     {"prerequisites": ["SQL"],                   "complexity": 3, "category": "core"},

    # ── Testing ──
    "Testing":             {"prerequisites": ["JavaScript"],            "complexity": 2, "category": "core"},

    # ── DevOps / Infra ──
    "Docker":              {"prerequisites": ["Linux"],                 "complexity": 3, "category": "tool"},
    "Kubernetes":          {"prerequisites": ["Docker"],                "complexity": 4, "category": "tool"},
    "CI/CD":               {"prerequisites": ["Git", "Docker"],         "complexity": 3, "category": "tool"},
    "AWS/GCP/Azure":       {"prerequisites": ["Linux"],                 "complexity": 4, "category": "tool"},
    "Terraform":           {"prerequisites": ["AWS/GCP/Azure"],         "complexity": 4, "category": "tool"},
    "Monitoring":          {"prerequisites": ["Linux"],                 "complexity": 2, "category": "tool"},
    "Networking":          {"prerequisites": ["Linux"],                 "complexity": 3, "category": "core"},
    "Ansible":             {"prerequisites": ["Linux"],                 "complexity": 3, "category": "tool"},
    "Helm":                {"prerequisites": ["Kubernetes"],            "complexity": 3, "category": "tool"},
    "GitOps":              {"prerequisites": ["Git", "CI/CD"],          "complexity": 3, "category": "advanced"},
    "Service Mesh":        {"prerequisites": ["Kubernetes"],            "complexity": 4, "category": "advanced"},
    "Security":            {"prerequisites": ["Networking"],            "complexity": 3, "category": "advanced"},

    # ── Data Science / ML ──
    "Statistics":          {"prerequisites": ["Python"],                "complexity": 3, "category": "core"},
    "Linear Algebra":      {"prerequisites": ["Python"],                "complexity": 3, "category": "core"},
    "NumPy":               {"prerequisites": ["Python"],                "complexity": 2, "category": "tool"},
    "Pandas":              {"prerequisites": ["Python", "NumPy"],       "complexity": 2, "category": "tool"},
    "Data Visualization":  {"prerequisites": ["Pandas"],                "complexity": 2, "category": "tool"},
    "Jupyter":             {"prerequisites": ["Python"],                "complexity": 1, "category": "tool"},
    "Machine Learning":    {"prerequisites": ["Statistics", "NumPy"],   "complexity": 4, "category": "framework"},
    "Deep Learning":       {"prerequisites": ["Machine Learning"],      "complexity": 5, "category": "advanced"},
    "NLP":                 {"prerequisites": ["Machine Learning"],      "complexity": 5, "category": "advanced"},
    "Apache Spark":        {"prerequisites": ["Python", "SQL"],         "complexity": 4, "category": "tool"},
    "Cloud ML":            {"prerequisites": ["Machine Learning", "AWS/GCP/Azure"], "complexity": 4, "category": "advanced"},
    "MLOps":               {"prerequisites": ["Docker", "Machine Learning", "CI/CD"], "complexity": 4, "category": "advanced"},

    # ── Mobile ──
    "React Native":        {"prerequisites": ["React"],                 "complexity": 3, "category": "framework"},
    "State Management":    {"prerequisites": ["React"],                 "complexity": 3, "category": "core"},
    "UI/UX":               {"prerequisites": [],                        "complexity": 2, "category": "core"},
    "App Store Deployment":{"prerequisites": ["React Native"],          "complexity": 2, "category": "tool"},
    "Performance Optimization": {"prerequisites": ["React"],            "complexity": 3, "category": "advanced"},
    "Swift":               {"prerequisites": [],                        "complexity": 3, "category": "framework"},
    "Kotlin":              {"prerequisites": [],                        "complexity": 3, "category": "framework"},
    "Flutter":             {"prerequisites": [],                        "complexity": 3, "category": "framework"},
    "Firebase":            {"prerequisites": [],                        "complexity": 2, "category": "tool"},

    # ── Misc Advanced ──
    "Microservices":       {"prerequisites": ["Docker", "REST APIs"],   "complexity": 4, "category": "advanced"},
    "Message Queues":      {"prerequisites": ["Node.js"],               "complexity": 3, "category": "advanced"},
    "Redis":               {"prerequisites": ["Database Design"],       "complexity": 2, "category": "tool"},
    "Cloud Services":      {"prerequisites": ["Linux"],                 "complexity": 3, "category": "tool"},
    "Figma":               {"prerequisites": [],                        "complexity": 1, "category": "tool"},

    # ═══════════════════════════════════════════════════════════════
    # ECE (Electronics & Communication) Skills
    # ═══════════════════════════════════════════════════════════════
    "Digital Electronics":       {"prerequisites": [],                              "complexity": 2, "category": "core"},
    "Analog Circuits":           {"prerequisites": [],                              "complexity": 3, "category": "core"},
    "Microcontrollers":          {"prerequisites": ["Digital Electronics"],          "complexity": 3, "category": "core"},
    "Signal Processing":         {"prerequisites": ["Digital Electronics"],          "complexity": 4, "category": "core"},
    "Embedded Systems":          {"prerequisites": ["Microcontrollers"],             "complexity": 4, "category": "framework"},
    "VLSI":                      {"prerequisites": ["Digital Electronics"],          "complexity": 5, "category": "advanced"},
    "Verilog":                   {"prerequisites": ["Digital Electronics"],          "complexity": 3, "category": "core"},
    "VHDL":                      {"prerequisites": ["Digital Electronics"],          "complexity": 3, "category": "core"},
    "MATLAB":                    {"prerequisites": [],                              "complexity": 2, "category": "tool"},
    "Keil":                      {"prerequisites": ["Microcontrollers"],             "complexity": 2, "category": "tool"},
    "LTspice":                   {"prerequisites": ["Analog Circuits"],             "complexity": 2, "category": "tool"},
    "PCB Design":                {"prerequisites": ["Analog Circuits"],             "complexity": 3, "category": "tool"},
    "Altium Designer":           {"prerequisites": ["PCB Design"],                   "complexity": 3, "category": "tool"},
    "KiCad":                     {"prerequisites": ["PCB Design"],                   "complexity": 2, "category": "tool"},
    "RTOS":                      {"prerequisites": ["Embedded Systems"],             "complexity": 4, "category": "framework"},
    "ARM":                       {"prerequisites": ["Microcontrollers"],             "complexity": 3, "category": "core"},
    "I2C/SPI/UART":              {"prerequisites": ["Microcontrollers"],             "complexity": 2, "category": "core"},
    "Firmware":                  {"prerequisites": ["Embedded Systems"],             "complexity": 4, "category": "advanced"},
    "Oscilloscopes":             {"prerequisites": ["Analog Circuits"],             "complexity": 1, "category": "tool"},
    "SystemVerilog":             {"prerequisites": ["Verilog"],                      "complexity": 4, "category": "advanced"},
    "ASIC Flow":                 {"prerequisites": ["Verilog"],                      "complexity": 5, "category": "advanced"},
    "FPGA Prototyping":          {"prerequisites": ["Verilog"],                      "complexity": 4, "category": "framework"},
    "Static Timing Analysis":    {"prerequisites": ["VLSI"],                         "complexity": 5, "category": "advanced"},
    "Cadence":                   {"prerequisites": ["VLSI"],                         "complexity": 4, "category": "tool"},
    "Schematic Capture":         {"prerequisites": ["Analog Circuits"],             "complexity": 2, "category": "core"},
    "Signal Integrity":          {"prerequisites": ["PCB Design"],                   "complexity": 4, "category": "advanced"},
    "Mixed Signal":              {"prerequisites": ["Analog Circuits", "Digital Electronics"], "complexity": 4, "category": "advanced"},
    "5G / LTE":                  {"prerequisites": ["Signal Processing"],            "complexity": 4, "category": "advanced"},
    "RF Design":                 {"prerequisites": ["Analog Circuits"],             "complexity": 4, "category": "advanced"},
    "Antenna Design":            {"prerequisites": ["Signal Processing"],            "complexity": 4, "category": "advanced"},
    "Wireless Comms":            {"prerequisites": ["Signal Processing"],            "complexity": 3, "category": "core"},
    "Network Optimization":      {"prerequisites": ["Wireless Comms"],               "complexity": 4, "category": "advanced"},
    "Microwave Engineering":     {"prerequisites": ["RF Design"],                    "complexity": 5, "category": "advanced"},
    "Digital Filters":           {"prerequisites": ["Signal Processing"],            "complexity": 3, "category": "core"},
    "Audio/Video Processing":    {"prerequisites": ["Signal Processing"],            "complexity": 4, "category": "advanced"},
    "Simulink":                  {"prerequisites": ["MATLAB"],                       "complexity": 3, "category": "tool"},
    "Computer Vision":           {"prerequisites": ["Signal Processing"],            "complexity": 4, "category": "advanced"},

    # ═══════════════════════════════════════════════════════════════
    # EEE (Electrical & Electronics) Skills
    # ═══════════════════════════════════════════════════════════════
    "Power Systems":             {"prerequisites": [],                              "complexity": 3, "category": "core"},
    "Control Systems":           {"prerequisites": [],                              "complexity": 3, "category": "core"},
    "Electrical Machines":       {"prerequisites": [],                              "complexity": 3, "category": "core"},
    "Circuits":                  {"prerequisites": [],                              "complexity": 2, "category": "core"},
    "Power Electronics":         {"prerequisites": ["Circuits"],                     "complexity": 4, "category": "core"},
    "ETAP":                      {"prerequisites": ["Power Systems"],                "complexity": 3, "category": "tool"},
    "PowerWorld":                {"prerequisites": ["Power Systems"],                "complexity": 3, "category": "tool"},
    "Multisim":                  {"prerequisites": ["Circuits"],                     "complexity": 2, "category": "tool"},
    "PLC":                       {"prerequisites": ["Control Systems"],              "complexity": 3, "category": "tool"},
    "SCADA":                     {"prerequisites": ["PLC"],                          "complexity": 3, "category": "tool"},
    "DCS":                       {"prerequisites": ["Control Systems"],              "complexity": 3, "category": "tool"},
    "PID Control":               {"prerequisites": ["Control Systems"],              "complexity": 3, "category": "core"},
    "Automation":                {"prerequisites": ["PLC"],                          "complexity": 3, "category": "framework"},
    "Sensors":                   {"prerequisites": [],                              "complexity": 2, "category": "core"},
    "Load Flow Analysis":        {"prerequisites": ["Power Systems"],                "complexity": 3, "category": "core"},
    "Substation Design":         {"prerequisites": ["Power Systems"],                "complexity": 4, "category": "advanced"},
    "Smart Grids":               {"prerequisites": ["Power Systems"],                "complexity": 4, "category": "advanced"},
    "Solar PV":                  {"prerequisites": ["Power Electronics"],            "complexity": 3, "category": "core"},
    "Wind Turbines":             {"prerequisites": ["Electrical Machines"],           "complexity": 3, "category": "core"},
    "Grid Integration":          {"prerequisites": ["Power Systems"],                "complexity": 4, "category": "advanced"},
    "Energy Storage":            {"prerequisites": ["Power Electronics"],            "complexity": 3, "category": "core"},
    "Homer":                     {"prerequisites": ["Power Systems"],                "complexity": 2, "category": "tool"},
    "AutoCAD Electrical":        {"prerequisites": [],                              "complexity": 2, "category": "tool"},
    "Revit MEP":                 {"prerequisites": [],                              "complexity": 3, "category": "tool"},
    "Dialux":                    {"prerequisites": [],                              "complexity": 2, "category": "tool"},
    "Lighting Design":           {"prerequisites": [],                              "complexity": 2, "category": "core"},
    "Panel Design":              {"prerequisites": ["AutoCAD Electrical"],           "complexity": 3, "category": "core"},

    # ═══════════════════════════════════════════════════════════════
    # Mechanical Engineering Skills
    # ═══════════════════════════════════════════════════════════════
    "Thermodynamics":            {"prerequisites": [],                              "complexity": 3, "category": "core"},
    "Fluid Mechanics":           {"prerequisites": [],                              "complexity": 3, "category": "core"},
    "Machine Design":            {"prerequisites": [],                              "complexity": 3, "category": "core"},
    "Manufacturing":             {"prerequisites": [],                              "complexity": 2, "category": "core"},
    "Heat Transfer":             {"prerequisites": ["Thermodynamics"],               "complexity": 3, "category": "core"},
    "Mechanics":                 {"prerequisites": [],                              "complexity": 2, "category": "core"},
    "SolidWorks":                {"prerequisites": [],                              "complexity": 2, "category": "tool"},
    "AutoCAD":                   {"prerequisites": [],                              "complexity": 2, "category": "tool"},
    "ANSYS":                     {"prerequisites": ["Mechanics"],                    "complexity": 4, "category": "tool"},
    "CATIA":                     {"prerequisites": [],                              "complexity": 3, "category": "tool"},
    "Fusion 360":                {"prerequisites": [],                              "complexity": 2, "category": "tool"},
    "GD&T":                      {"prerequisites": ["Machine Design"],               "complexity": 3, "category": "core"},
    "Material Science":          {"prerequisites": [],                              "complexity": 3, "category": "core"},
    "Prototyping":               {"prerequisites": ["SolidWorks"],                   "complexity": 2, "category": "core"},
    "DFM":                       {"prerequisites": ["Manufacturing"],                "complexity": 3, "category": "core"},
    "Lean Six Sigma":            {"prerequisites": ["Manufacturing"],                "complexity": 3, "category": "framework"},
    "CAM":                       {"prerequisites": ["AutoCAD"],                      "complexity": 3, "category": "tool"},
    "Root Cause Analysis":       {"prerequisites": [],                              "complexity": 2, "category": "core"},
    "Quality Control":           {"prerequisites": ["Manufacturing"],                "complexity": 2, "category": "core"},
    "Six Sigma":                 {"prerequisites": ["Manufacturing"],                "complexity": 3, "category": "framework"},
    "ROS":                       {"prerequisites": [],                              "complexity": 4, "category": "framework"},
    "Kinematics":                {"prerequisites": ["Mechanics"],                    "complexity": 3, "category": "core"},
    "Mechatronics":              {"prerequisites": ["Mechanics"],                    "complexity": 4, "category": "advanced"},
    "ANSYS Fluent":              {"prerequisites": ["Fluid Mechanics"],              "complexity": 4, "category": "tool"},
    "CFD":                       {"prerequisites": ["Fluid Mechanics"],              "complexity": 4, "category": "advanced"},
    "HVAC Design":               {"prerequisites": ["Thermodynamics"],               "complexity": 3, "category": "core"},
    "Vehicle Dynamics":          {"prerequisites": ["Mechanics"],                    "complexity": 4, "category": "advanced"},
    "EV Systems":                {"prerequisites": ["Power Electronics"],            "complexity": 4, "category": "advanced"},
    "Battery Design":            {"prerequisites": [],                              "complexity": 4, "category": "advanced"},
    "FEA":                       {"prerequisites": ["ANSYS"],                        "complexity": 4, "category": "advanced"},
    "PLC Programming":           {"prerequisites": [],                              "complexity": 3, "category": "tool"},

    # ═══════════════════════════════════════════════════════════════
    # Civil Engineering Skills
    # ═══════════════════════════════════════════════════════════════
    "Structural Analysis":       {"prerequisites": [],                              "complexity": 3, "category": "core"},
    "Surveying":                 {"prerequisites": [],                              "complexity": 2, "category": "core"},
    "Construction Planning":     {"prerequisites": [],                              "complexity": 2, "category": "core"},
    "Geotech":                   {"prerequisites": [],                              "complexity": 3, "category": "core"},
    "Transportation":            {"prerequisites": [],                              "complexity": 3, "category": "core"},
    "STAAD.Pro":                 {"prerequisites": ["Structural Analysis"],          "complexity": 3, "category": "tool"},
    "ETABS":                     {"prerequisites": ["Structural Analysis"],          "complexity": 3, "category": "tool"},
    "Revit":                     {"prerequisites": [],                              "complexity": 3, "category": "tool"},
    "Primavera":                 {"prerequisites": ["Construction Planning"],        "complexity": 3, "category": "tool"},
    "Civil 3D":                  {"prerequisites": ["AutoCAD"],                      "complexity": 3, "category": "tool"},
    "SAP2000":                   {"prerequisites": ["Structural Analysis"],          "complexity": 3, "category": "tool"},
    "Concrete Design":           {"prerequisites": ["Structural Analysis"],          "complexity": 3, "category": "core"},
    "Steel Design":              {"prerequisites": ["Structural Analysis"],          "complexity": 3, "category": "core"},
    "Building Codes":            {"prerequisites": [],                              "complexity": 2, "category": "core"},
    "Navisworks":                {"prerequisites": ["Revit"],                         "complexity": 3, "category": "tool"},
    "BIM 360":                   {"prerequisites": ["Revit"],                         "complexity": 3, "category": "tool"},
    "Clash Detection":           {"prerequisites": ["Revit"],                         "complexity": 3, "category": "core"},
    "AutoCAD 3D":                {"prerequisites": ["AutoCAD"],                      "complexity": 2, "category": "tool"},
    "Dynamo":                    {"prerequisites": ["Revit"],                         "complexity": 3, "category": "tool"},
    "Project Management":        {"prerequisites": [],                              "complexity": 2, "category": "core"},
    "MS Project":                {"prerequisites": [],                              "complexity": 2, "category": "tool"},
    "Cost Estimation":           {"prerequisites": ["Construction Planning"],        "complexity": 3, "category": "core"},
    "Contract Management":       {"prerequisites": [],                              "complexity": 2, "category": "core"},
    "Site Supervision":          {"prerequisites": ["Construction Planning"],        "complexity": 2, "category": "core"},
    "Soil Mechanics":            {"prerequisites": ["Geotech"],                      "complexity": 3, "category": "core"},
    "Foundation Design":         {"prerequisites": ["Soil Mechanics"],               "complexity": 4, "category": "core"},
    "GeoStudio":                 {"prerequisites": ["Geotech"],                      "complexity": 3, "category": "tool"},
    "PLAXIS":                    {"prerequisites": ["Geotech"],                      "complexity": 4, "category": "tool"},
    "Site Investigation":        {"prerequisites": ["Surveying"],                    "complexity": 2, "category": "core"},
    "Retaining Walls":           {"prerequisites": ["Structural Analysis"],          "complexity": 3, "category": "core"},
    "Highway Design":            {"prerequisites": ["Transportation"],               "complexity": 3, "category": "core"},
    "Traffic Engineering":       {"prerequisites": ["Transportation"],               "complexity": 3, "category": "core"},
    "VISSIM":                    {"prerequisites": ["Traffic Engineering"],           "complexity": 3, "category": "tool"},
    "Pavement Design":           {"prerequisites": ["Transportation"],               "complexity": 3, "category": "core"},
    "Synchro":                   {"prerequisites": ["Traffic Engineering"],           "complexity": 3, "category": "tool"},
    "GIS / ArcGIS":              {"prerequisites": [],                              "complexity": 3, "category": "tool"},
}


# ═══════════════════════════════════════════════════════════════════
# 9. ROLE CONFIGURATION (core / advanced / optional)
# ═══════════════════════════════════════════════════════════════════

ROLE_CONFIG: dict[str, dict[str, list[str]]] = {
    # ── Software / IT Roles ──
    "frontend_developer": {
        "core":     ["HTML", "CSS", "JavaScript", "React", "Git", "Responsive Design", "REST APIs", "Testing"],
        "advanced": ["TypeScript", "Next.js", "Webpack/Vite"],
        "optional": ["GraphQL", "Tailwind CSS", "Figma", "CI/CD"],
    },
    "backend_developer": {
        "core":     ["Python", "JavaScript", "SQL", "REST APIs", "Git", "Docker", "Authentication", "Database Design", "Testing", "Linux"],
        "advanced": ["Kubernetes", "Message Queues", "GraphQL", "CI/CD", "Microservices"],
        "optional": ["Terraform", "Redis", "Monitoring"],
    },
    "data_scientist": {
        "core":     ["Python", "Statistics", "Machine Learning", "SQL", "Pandas", "NumPy", "Data Visualization", "Jupyter", "Git", "Linear Algebra"],
        "advanced": ["Deep Learning", "NLP", "Apache Spark", "Cloud ML", "MLOps"],
        "optional": ["Docker", "AWS/GCP/Azure"],
    },
    "devops_engineer": {
        "core":     ["Linux", "Docker", "Kubernetes", "CI/CD", "AWS/GCP/Azure", "Terraform", "Git", "Scripting", "Monitoring", "Networking"],
        "advanced": ["Ansible", "Service Mesh", "Security", "Helm", "GitOps"],
        "optional": ["Python", "SQL"],
    },
    "mobile_developer": {
        "core":     ["JavaScript", "React", "React Native", "Git", "REST APIs", "State Management", "UI/UX", "Testing"],
        "advanced": ["TypeScript", "App Store Deployment", "Performance Optimization"],
        "optional": ["Swift", "Kotlin", "Flutter", "GraphQL", "Firebase"],
    },
    "full_stack_developer": {
        "core":     ["HTML", "CSS", "JavaScript", "React", "Node.js", "SQL", "Git", "REST APIs", "Docker", "Testing"],
        "advanced": ["TypeScript", "GraphQL", "CI/CD", "Cloud Services", "Redis"],
        "optional": ["Kubernetes", "Microservices", "Monitoring"],
    },

    # ── ECE Roles ──
    "embedded_engineer": {
        "core":     ["Digital Electronics", "Microcontrollers", "ARM", "I2C/SPI/UART", "Embedded Systems", "Oscilloscopes"],
        "advanced": ["RTOS", "Firmware", "PCB Design"],
        "optional": ["MATLAB", "Keil", "Computer Vision"],
    },
    "vlsi_engineer": {
        "core":     ["Digital Electronics", "Verilog", "VHDL", "VLSI", "FPGA Prototyping", "SystemVerilog"],
        "advanced": ["ASIC Flow", "Static Timing Analysis", "Cadence"],
        "optional": ["MATLAB", "Signal Processing"],
    },
    "hardware_engineer": {
        "core":     ["Analog Circuits", "Digital Electronics", "PCB Design", "Schematic Capture", "Oscilloscopes"],
        "advanced": ["Altium Designer", "Signal Integrity", "Mixed Signal"],
        "optional": ["KiCad", "LTspice"],
    },
    "telecom_engineer": {
        "core":     ["Signal Processing", "Wireless Comms", "RF Design", "MATLAB", "Analog Circuits"],
        "advanced": ["5G / LTE", "Antenna Design", "Network Optimization"],
        "optional": ["Microwave Engineering", "Digital Filters"],
    },
    "dsp_engineer": {
        "core":     ["Signal Processing", "MATLAB", "Digital Filters", "Digital Electronics"],
        "advanced": ["Audio/Video Processing", "Simulink", "FPGA Prototyping"],
        "optional": ["Computer Vision", "Verilog"],
    },

    # ── EEE Roles ──
    "power_engineer": {
        "core":     ["Power Systems", "Circuits", "MATLAB", "Load Flow Analysis", "Power Electronics"],
        "advanced": ["ETAP", "PowerWorld", "Substation Design"],
        "optional": ["Smart Grids", "Homer"],
    },
    "control_engineer": {
        "core":     ["Control Systems", "PLC", "PID Control", "MATLAB", "Sensors"],
        "advanced": ["SCADA", "DCS", "Automation", "Simulink"],
        "optional": ["Multisim"],
    },
    "renewable_engineer": {
        "core":     ["Power Systems", "Power Electronics", "Solar PV", "Wind Turbines", "Circuits"],
        "advanced": ["Grid Integration", "Energy Storage", "Homer"],
        "optional": ["MATLAB", "Smart Grids"],
    },
    "electrical_designer": {
        "core":     ["AutoCAD Electrical", "Circuits", "Panel Design", "Lighting Design"],
        "advanced": ["ETAP", "Revit MEP", "Dialux"],
        "optional": ["Power Systems"],
    },

    # ── Mechanical Roles ──
    "design_engineer": {
        "core":     ["SolidWorks", "AutoCAD", "GD&T", "Material Science", "Machine Design", "Mechanics"],
        "advanced": ["ANSYS", "Prototyping", "DFM"],
        "optional": ["CATIA", "Fusion 360"],
    },
    "manufacturing_engineer": {
        "core":     ["Manufacturing", "AutoCAD", "Quality Control", "Root Cause Analysis"],
        "advanced": ["Lean Six Sigma", "CAM", "PLC Programming", "Six Sigma"],
        "optional": ["SolidWorks"],
    },
    "robotics_engineer": {
        "core":     ["Mechanics", "Kinematics", "ROS", "Python"],
        "advanced": ["Control Systems", "Mechatronics", "Computer Vision"],
        "optional": ["MATLAB", "Simulink"],
    },
    "thermal_engineer": {
        "core":     ["Thermodynamics", "Heat Transfer", "Fluid Mechanics"],
        "advanced": ["ANSYS Fluent", "CFD", "HVAC Design"],
        "optional": ["MATLAB", "SolidWorks"],
    },
    "automotive_engineer": {
        "core":     ["Machine Design", "Mechanics", "SolidWorks", "AutoCAD"],
        "advanced": ["Vehicle Dynamics", "EV Systems", "FEA"],
        "optional": ["CATIA", "Battery Design"],
    },

    # ── Civil Roles ──
    "structural_engineer": {
        "core":     ["Structural Analysis", "AutoCAD", "Building Codes", "Concrete Design", "Steel Design"],
        "advanced": ["STAAD.Pro", "ETABS", "SAP2000"],
        "optional": ["Revit"],
    },
    "bim_engineer": {
        "core":     ["Revit", "AutoCAD", "Clash Detection", "Project Management"],
        "advanced": ["Navisworks", "BIM 360", "AutoCAD 3D", "Dynamo"],
        "optional": ["Primavera"],
    },
    "construction_manager": {
        "core":     ["Construction Planning", "Project Management", "Cost Estimation", "Site Supervision"],
        "advanced": ["Primavera", "MS Project", "Contract Management"],
        "optional": ["Quality Control"],
    },
    "geotechnical_engineer": {
        "core":     ["Geotech", "Soil Mechanics", "Surveying", "Site Investigation"],
        "advanced": ["Foundation Design", "GeoStudio", "PLAXIS", "Retaining Walls"],
        "optional": ["AutoCAD"],
    },
    "transportation_engineer": {
        "core":     ["Transportation", "AutoCAD", "Highway Design", "Traffic Engineering"],
        "advanced": ["Civil 3D", "Pavement Design", "VISSIM", "Synchro"],
        "optional": ["GIS / ArcGIS"],
    },
}


# ═══════════════════════════════════════════════════════════════════
# 7. CACHE
# ═══════════════════════════════════════════════════════════════════

_cache: dict[str, dict] = {}


def _cache_key(role: str, skills: list[str], level: str, months: int, daily_hours: int) -> str:
    raw = f"{role}|{'|'.join(sorted(skills))}|{level}|{months}|{daily_hours}"
    return hashlib.sha256(raw.encode()).hexdigest()


# ═══════════════════════════════════════════════════════════════════
# 3. TOPOLOGICAL SORT  (learning order resolver)
# ═══════════════════════════════════════════════════════════════════

def _resolve_prerequisites(skill: str, resolved: set[str]) -> list[str]:
    """Recursively gather all prerequisite skills not already resolved."""
    info = SKILL_GRAPH.get(skill)
    if not info:
        return [skill] if skill not in resolved else []
    needed: list[str] = []
    for prereq in info["prerequisites"]:
        if prereq not in resolved:
            needed.extend(_resolve_prerequisites(prereq, resolved | set(needed)))
    if skill not in resolved and skill not in needed:
        needed.append(skill)
    return list(dict.fromkeys(needed))  # dedupe preserving order


def topological_sort(skills: list[str]) -> list[str]:
    """Kahn's algorithm — returns a valid learning order respecting prerequisites."""
    # Build subgraph of only the requested skills + their prereqs
    all_skills: list[str] = []
    seen: set[str] = set()
    for s in skills:
        for dep in _resolve_prerequisites(s, seen):
            if dep not in seen:
                all_skills.append(dep)
                seen.add(dep)

    # Build adjacency + in-degree for subgraph
    in_degree: dict[str, int] = {s: 0 for s in all_skills}
    adj: dict[str, list[str]] = defaultdict(list)
    skill_set = set(all_skills)
    for s in all_skills:
        info = SKILL_GRAPH.get(s)
        if info:
            for p in info["prerequisites"]:
                if p in skill_set:
                    adj[p].append(s)
                    in_degree[s] += 1

    # Use a priority queue so same-category, similar-complexity skills
    # are emitted adjacently → better phase grouping downstream
    import heapq

    def _sort_key(s: str):
        info = SKILL_GRAPH.get(s, {"complexity": 2, "category": "core"})
        cat_order = {"core": 0, "tool": 1, "framework": 2, "advanced": 3}
        return (info["complexity"], cat_order.get(info["category"], 9), s)

    heap = sorted([_sort_key(s) + (s,) for s in all_skills if in_degree[s] == 0])
    heapq.heapify(heap)
    result: list[str] = []
    while heap:
        *_, node = heapq.heappop(heap)
        result.append(node)
        for neighbour in adj[node]:
            in_degree[neighbour] -= 1
            if in_degree[neighbour] == 0:
                heapq.heappush(heap, _sort_key(neighbour) + (neighbour,))
    return result


# ═══════════════════════════════════════════════════════════════════
# 8. LEVEL-AWARE SKILL SELECTION
# ═══════════════════════════════════════════════════════════════════

def select_skills_for_level(
    role_key: str,
    current_level: str,
    domain: str,
    user_skills: Optional[list[str]] = None,
) -> list[str]:
    """Pick the right skill set based on user level and role config."""
    domain_data = get_domain_knowledge(domain)
    
    if role_key in ROLE_CONFIG:
        cfg = ROLE_CONFIG[role_key]
    else:
        # Fallback to deterministic domain data for non-software roles
        cfg = {
            "core": domain_data["core_skills"],
            "advanced": domain_data["tools"],
            "optional": []
        }

    if user_skills:
        # User explicitly listed what they want to learn
        return user_skills

    if current_level == "Beginner":
        return cfg["core"]
    elif current_level == "Intermediate":
        # Skip pure foundational (complexity <= 1) already mastered
        return [s for s in cfg["core"] if SKILL_GRAPH.get(s, {}).get("complexity", 2) >= 2] + cfg["advanced"][:3]
    else:  # Advanced
        return cfg["advanced"] + cfg["optional"][:3]


# ═══════════════════════════════════════════════════════════════════
# 4. SMART PHASE GROUPING
# ═══════════════════════════════════════════════════════════════════

def group_into_phases(ordered_skills: list[str], max_per_phase: int = 3) -> list[list[str]]:
    """
    Group skills into phases respecting:
    - dependency chains stay together
    - similar category/complexity grouped
    - max 3 skills per phase
    """
    if not ordered_skills:
        return []

    phases: list[list[str]] = []
    current_phase: list[str] = []

    for skill in ordered_skills:
        info = SKILL_GRAPH.get(skill, {"complexity": 2, "category": "core"})

        if not current_phase:
            current_phase.append(skill)
            continue

        # Check compatibility with current phase
        last_info = SKILL_GRAPH.get(current_phase[-1], {"complexity": 2, "category": "core"})
        same_category = info["category"] == last_info["category"]
        complexity_diff = abs(info["complexity"] - last_info["complexity"])
        is_direct_prereq = skill in [
            s for p in current_phase
            for s in _get_dependents(p)
        ]

        should_group = (
            len(current_phase) < max_per_phase
            and (same_category or is_direct_prereq or complexity_diff <= 1)
        )

        if should_group:
            current_phase.append(skill)
        else:
            phases.append(current_phase)
            current_phase = [skill]

    if current_phase:
        phases.append(current_phase)

    return phases


def _get_dependents(skill: str) -> list[str]:
    """Skills that directly depend on `skill`."""
    deps = []
    for name, info in SKILL_GRAPH.items():
        if skill in info.get("prerequisites", []):
            deps.append(name)
    return deps


# ═══════════════════════════════════════════════════════════════════
# 5. DURATION CALCULATION
# ═══════════════════════════════════════════════════════════════════

BASE_HOURS_PER_COMPLEXITY = 12  # e.g., complexity‑3 skill = 36 hours


def calculate_phase_durations(
    phases: list[list[str]],
    timeline_months: int,
    daily_hours: int,
) -> list[str]:
    """Return a list of human-readable durations, one per phase."""
    total_budget_hours = timeline_months * 4 * 5 * daily_hours  # weeks * workdays * hours

    # Raw hours per phase
    raw_hours: list[float] = []
    for phase_skills in phases:
        h = sum(
            SKILL_GRAPH.get(s, {"complexity": 2})["complexity"] * BASE_HOURS_PER_COMPLEXITY
            for s in phase_skills
        )
        raw_hours.append(h)

    total_raw = sum(raw_hours) or 1

    # Proportional fit to budget
    durations: list[str] = []
    for h in raw_hours:
        proportion = h / total_raw
        phase_hours = proportion * total_budget_hours
        weeks = max(1, math.ceil(phase_hours / (daily_hours * 5)))
        if weeks >= 5:
            durations.append(f"{round(weeks / 4, 1)} months")
        else:
            durations.append(f"{weeks} weeks")

    return durations


# ═══════════════════════════════════════════════════════════════════
# PHASE TITLE GENERATOR
# ═══════════════════════════════════════════════════════════════════

_PHASE_LABELS = [
    "Foundation", "Core Fundamentals", "Core Development",
    "Intermediate Build", "Advanced Topics", "Specialization",
    "Mastery & Integration", "Professional Polish",
]


def _phase_title(index: int, skills: list[str]) -> str:
    label = _PHASE_LABELS[min(index, len(_PHASE_LABELS) - 1)]
    return f"Phase {index + 1}: {label}"


# ═══════════════════════════════════════════════════════════════════
# 6. SINGLE AI ENHANCEMENT CALL  +  7. AI SAFETY LAYER
# ═══════════════════════════════════════════════════════════════════

_AI_SYSTEM_PROMPT = """You are VidyaMitra's curriculum designer.
You receive a list of learning phases, each with its skills and duration.

For EACH phase you MUST return a JSON object with EXACTLY these fields:
- "reasoning": 1–2 sentences explaining why this phase exists
- "daily_plan": array of 5–15 strings, each starting with a time marker (e.g., "Day 1-3:", "Week 2:", "Month 1:") spanning the ENTIRE phase duration. Provide specific, actionable tasks.
- "project_to_build": one specific project name and brief description
- "expected_outcome": a concrete capability the learner gains
- "resources": array of 1–3 objects with {"name": "", "url": "", "platform": ""}. URLs MUST be real, direct HTTPS links (no search URLs).

STRICT RULES:
- Do NOT change skill names, skill order, or phase structure
- Do NOT add or remove skills
- Do NOT output anything outside JSON
- Output MUST be a valid JSON array matching the number of phases
- Ensure the projects and daily plans are absolutely relevant to the Engineering Domain. Do not hallucinate web-development projects for mechanical engineers or generic programming for civil.

Think like a strict mentor writing an execution plan, not a content generator."""


def _build_ai_user_prompt(target_role: str, phases_data: list[dict], domain: str) -> str:
    return f"""Engineering Domain: {domain}
Target Role: {target_role}

Phases to enhance:
{json.dumps(phases_data, indent=2)}

Return a JSON array with one object per phase. Each object has: reasoning, daily_plan, project_to_build, expected_outcome, resources."""


def _extract_json_from_text(text: str) -> Optional[list]:
    """Robustly extract JSON from LLM response that may include markdown fences."""
    # Try direct parse
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Strip markdown code fences
    cleaned = re.sub(r"```(?:json)?\s*", "", text)
    cleaned = re.sub(r"```\s*$", "", cleaned).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Try to find the first JSON array in the text
    match = re.search(r"\[.*\]", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return None


def _fallback_enhancement(phase_skills: list[str], duration: str) -> dict:
    """Deterministic fallback when AI fails."""
    skills_str = ", ".join(phase_skills)
    return {
        "reasoning": f"This phase builds competency in {skills_str}, following the prerequisite chain.",
        "daily_plan": [
            f"Step 1: Study core concepts of {phase_skills[0]} from official documentation",
            f"Step 2: Complete hands-on exercises and coding challenges for {phase_skills[0]}",
            f"Step 3: Build a small practice project applying {phase_skills[0]} concepts",
            f"Step 4: Study advanced patterns and best practices" + (f" for {phase_skills[1]}" if len(phase_skills) > 1 else ""),
            f"Step 5: Review, refactor previous code, and solve 5 practice problems",
            f"Step 6: Work on the phase project integrating all skills learned",
            f"Step 7: Review progress, document learnings, plan next steps",
        ],
        "project_to_build": f"Build a mini-project demonstrating {skills_str} in a real-world scenario",
        "expected_outcome": f"Able to confidently use {skills_str} in production-level work",
        "resources": [
            {"name": f"MDN Web Docs — {phase_skills[0]}", "url": "https://developer.mozilla.org", "platform": "MDN"},
        ],
    }


def enrich_phases_with_ai(
    target_role: str,
    phases_data: list[dict],
    domain: str,
    max_retries: int = 3,
) -> list[dict]:
    """Call AI once for all phases. Retry on failure. Fallback if all retries exhausted."""
    user_prompt = _build_ai_user_prompt(target_role, phases_data, domain)

    for attempt in range(max_retries):
        try:
            response = _client.chat.completions.create(
                model=AI_MODEL,
                messages=[
                    {"role": "system", "content": _AI_SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.4,
                max_tokens=4096,
            )
            raw = response.choices[0].message.content
            parsed = _extract_json_from_text(raw)
            if parsed and isinstance(parsed, list) and len(parsed) == len(phases_data):
                return parsed
            # Length mismatch → retry
        except Exception as e:
            print(f"[RoadmapEngine] AI attempt {attempt + 1} failed: {e}")

    # All retries exhausted → fallback
    print("[RoadmapEngine] All AI retries exhausted, using fallback enhancements.")
    return [
        _fallback_enhancement(p["skills"], p["duration"])
        for p in phases_data
    ]


# ═══════════════════════════════════════════════════════════════════
# 10. STRICT VALIDATION LAYER
# ═══════════════════════════════════════════════════════════════════

def _is_valid_https(url: str) -> bool:
    try:
        return url.startswith("https://") and len(url) > 12
    except Exception:
        return False


def validate_and_sanitize(enhancement: dict, phase_skills: list[str], duration: str) -> dict:
    """Ensure every field meets quality bar; replace bad values with safe defaults."""
    fb = _fallback_enhancement(phase_skills, duration)

    # Reasoning
    reasoning = enhancement.get("reasoning", "")
    if not reasoning or len(reasoning) < 10:
        reasoning = fb["reasoning"]

    # Daily plan / Action plan
    daily_plan = enhancement.get("daily_plan", [])
    if not isinstance(daily_plan, list) or len(daily_plan) < 3:
        daily_plan = fb["daily_plan"]
    else:
        # Ensure each item is actionable
        daily_plan = [
            item if isinstance(item, str) and len(item) > 10 else fb["daily_plan"][i % len(fb["daily_plan"])]
            for i, item in enumerate(daily_plan)
        ]

    # Project
    project = enhancement.get("project_to_build", "")
    if not project or len(project) < 5:
        project = fb["project_to_build"]

    # Outcome
    outcome = enhancement.get("expected_outcome", "")
    if not outcome or len(outcome) < 10:
        outcome = fb["expected_outcome"]

    # Resources
    resources = enhancement.get("resources", [])
    if not isinstance(resources, list):
        resources = fb["resources"]
    valid_resources = []
    for r in resources:
        if isinstance(r, dict) and _is_valid_https(r.get("url", "")):
            valid_resources.append({
                "name": r.get("name", "Resource"),
                "url": r["url"],
                "platform": r.get("platform", "Web"),
            })
    if not valid_resources:
        valid_resources = fb["resources"]

    return {
        "reasoning": reasoning,
        "daily_plan": daily_plan,
        "project_to_build": project,
        "expected_outcome": outcome,
        "resources": valid_resources,
    }


# ═══════════════════════════════════════════════════════════════════
# MAIN ORCHESTRATOR
# ═══════════════════════════════════════════════════════════════════

def generate_roadmap(
    target_role: str,
    current_level: str = "Beginner",
    missing_skills: Optional[list[str]] = None,
    timeline_months: int = 6,
    daily_time_commitment: int = 2,
    domain: str = "Software Engineering / CS / IT",
) -> dict:
    """
    Full pipeline: Data → Logic → AI → Validate → Output.
    Returns strict JSON‑ready dict.
    """
    role_key = target_role.lower().replace(" ", "_")
    domain_data = get_domain_knowledge(domain)

    # ── Check cache ──
    effective_skills = missing_skills or []
    ck = _cache_key(role_key, effective_skills, current_level + domain, timeline_months, daily_time_commitment)
    if ck in _cache:
        cached = _cache[ck].copy()
        cached["cached"] = True
        return cached

    # ── 1. Skill selection (level-aware) ──
    raw_skills = select_skills_for_level(
        role_key, current_level, domain, missing_skills if missing_skills else None
    )

    # ── 2. Topological sort ──
    ordered = topological_sort(raw_skills)

    # ── 3. Smart phase grouping ──
    phase_groups = group_into_phases(ordered)

    # ── 4. Duration calculation ──
    durations = calculate_phase_durations(phase_groups, timeline_months, daily_time_commitment)

    # ── 5. Prepare phase metadata for AI ──
    phases_for_ai = []
    for i, skills in enumerate(phase_groups):
        phases_for_ai.append({
            "phase_number": i + 1,
            "title": _phase_title(i, skills),
            "skills": skills,
            "duration": durations[i],
        })

    # ── 6. AI enhancement (single call) ──
    ai_enhancements = enrich_phases_with_ai(target_role, phases_for_ai, domain_data["name"])

    # ── 7. Merge + Validate ──
    final_phases = []
    for i, meta in enumerate(phases_for_ai):
        enhancement = ai_enhancements[i] if i < len(ai_enhancements) else {}
        validated = validate_and_sanitize(enhancement, meta["skills"], meta["duration"])

        final_phases.append({
            "title": meta["title"],
            "duration": meta["duration"],
            "skills": meta["skills"],
            "reasoning": validated["reasoning"],
            "daily_plan": validated["daily_plan"],
            "project_to_build": validated["project_to_build"],
            "expected_outcome": validated["expected_outcome"],
            "resources": validated["resources"],
        })

    # ── 8. Assemble response ──
    result = {
        "target_role": target_role,
        "total_duration": f"{timeline_months} months",
        "phases": final_phases,
        "tips": _generate_tips(current_level, daily_time_commitment),
        "cached": False,
    }

    # ── 9. Cache it ──
    _cache[ck] = result

    return result


def _generate_tips(level: str, daily_hours: int) -> list[str]:
    tips = [
        f"Dedicate at least {daily_hours} focused hours daily — consistency beats intensity.",
        "Build a portfolio project after each phase to solidify your learning.",
        "Join online communities (Discord, Reddit, Stack Overflow) for peer support.",
        "Track your progress weekly; adjust pace if needed.",
        "Apply concepts immediately — learning by doing is 3× more effective than passive reading.",
    ]
    if level == "Beginner":
        tips.append("Don't skip fundamentals — every advanced concept builds on basics.")
    elif level == "Advanced":
        tips.append("Focus on system design and real-world architecture patterns at this stage.")
    return tips
