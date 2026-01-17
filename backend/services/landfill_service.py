from typing import Optional, Dict
from utils.image_processor import ImageProcessor
import random


class LandfillService:
    """Service for analyzing landfill/waste detection"""
    
    def __init__(self):
        self.image_processor = ImageProcessor()
    
    async def analyze(
        self,
        image_path: str,
        location: Optional[str] = None,
        description: Optional[str] = None
    ) -> Dict:
        """
        Analyze image for landfill/waste detection
        """
        # Load image
        image = self.image_processor.load_image(image_path)
        
        # Detect waste
        waste_analysis = self.image_processor.detect_waste(image)
        
        # Calculate confidence based on multiple factors
        confidence = min(100, int(
            waste_analysis["waste_percentage"] * 0.6 +
            waste_analysis["edge_density"] * 0.3 +
            (waste_analysis["texture_variance"] / 100) * 0.1
        ))
        
        # Determine waste type based on analysis
        waste_types = []
        if waste_analysis["waste_percentage"] > 30:
            waste_types.append("Mixed Solid Waste")
        if waste_analysis["edge_density"] > 15:
            waste_types.append("Construction Debris")
        if waste_analysis["texture_variance"] > 2000:
            waste_types.append("Industrial Waste")
        
        if not waste_types:
            waste_types.append("Organic/Natural Material")
        
        waste_type = ", ".join(waste_types)
        
        # Determine severity
        if confidence > 75 and waste_analysis["waste_detected"]:
            severity = "High"
        elif confidence > 50 and waste_analysis["waste_detected"]:
            severity = "Medium"
        else:
            severity = "Low"
        
        # Estimate affected area
        estimated_area = round(waste_analysis["waste_percentage"] * 10 + random.uniform(50, 200), 2)
        
        # Generate detected issues
        issues = []
        if waste_analysis["waste_detected"]:
            issues.append(f"Waste accumulation detected covering approximately {waste_analysis['waste_percentage']:.1f}% of the area")
        if waste_analysis["edge_density"] > 20:
            issues.append("Irregular dumping patterns suggesting illegal disposal")
        if confidence > 70:
            issues.append("High confidence waste detection - likely requires immediate attention")
        if severity == "High":
            issues.append("Potential environmental hazard identified")
        
        if not issues:
            issues.append("No significant waste accumulation detected")
        
        # Generate environmental impact
        environmental_impact = []
        if severity in ["High", "Medium"]:
            environmental_impact.extend([
                "Potential soil contamination risk",
                "Possible groundwater pollution threat",
                "Wildlife habitat disruption",
                "Air quality degradation from decomposition"
            ])
        else:
            environmental_impact.append("Minimal environmental impact detected")
        
        # Generate recommendations
        recommendations = []
        if severity == "High":
            recommendations.extend([
                "Immediate cleanup operation required",
                "Contact local pollution control board",
                "Conduct soil and water quality testing",
                "Identify and penalize illegal dumpers",
                "Install surveillance to prevent future dumping"
            ])
        elif severity == "Medium":
            recommendations.extend([
                "Schedule cleanup within 7 days",
                "Increase monitoring of the area",
                "Post warning signs against illegal dumping",
                "Engage community awareness programs"
            ])
        else:
            recommendations.extend([
                "Continue regular monitoring",
                "Maintain cleanliness standards",
                "Promote proper waste disposal practices"
            ])
        
        return {
            "waste_detected": waste_analysis["waste_detected"],
            "confidence": confidence,
            "waste_type": waste_type,
            "severity": severity,
            "estimated_area": estimated_area,
            "issues": issues,
            "environmental_impact": environmental_impact,
            "recommendations": recommendations,
            "location": location,
            "description": description,
            "analysis_details": {
                "waste_percentage": waste_analysis["waste_percentage"],
                "edge_density": waste_analysis["edge_density"],
                "texture_variance": waste_analysis["texture_variance"]
            }
        }
