from typing import Optional, Dict
from utils.image_processor import ImageProcessor
import random


class DeforestationService:
    """Service for analyzing deforestation"""
    
    def __init__(self):
        self.image_processor = ImageProcessor()
    
    async def analyze(
        self,
        before_image_path: str,
        after_image_path: str,
        location: Optional[str] = None
    ) -> Dict:
        """
        Analyze deforestation by comparing before and after images
        """
        # Load images
        before_image = self.image_processor.load_image(before_image_path)
        after_image = self.image_processor.load_image(after_image_path)
        
        # Compare images
        comparison = self.image_processor.compare_images(before_image, after_image)
        
        # Calculate metrics
        vegetation_loss = comparison["vegetation_loss"]
        ndvi_change = comparison["ndvi_change"]
        
        # Estimate affected area (simplified calculation)
        # In production, this would use GPS/satellite data
        affected_area = round(vegetation_loss * 0.5 + random.uniform(5, 20), 2)
        
        # Determine severity
        if vegetation_loss > 40:
            severity = "High"
        elif vegetation_loss > 20:
            severity = "Medium"
        else:
            severity = "Low"
        
        # Generate detected changes
        changes = []
        if vegetation_loss > 10:
            changes.append(f"Significant vegetation loss detected: {vegetation_loss}%")
        if ndvi_change < -0.1:
            changes.append(f"NDVI decreased by {abs(ndvi_change):.3f}, indicating vegetation stress")
        if vegetation_loss > 30:
            changes.append("Large-scale deforestation pattern identified")
        if comparison["vegetation_after"] < 20:
            changes.append("Critical vegetation coverage remaining")
        
        if not changes:
            changes.append("Minimal vegetation changes detected")
        
        # Generate recommendations
        recommendations = []
        if severity == "High":
            recommendations.extend([
                "Immediate intervention required - contact forest authorities",
                "Conduct ground survey to assess damage extent",
                "Implement reforestation program in affected areas",
                "Monitor for illegal logging activities"
            ])
        elif severity == "Medium":
            recommendations.extend([
                "Schedule detailed assessment of the area",
                "Increase monitoring frequency",
                "Consider conservation measures",
                "Engage with local communities for protection"
            ])
        else:
            recommendations.extend([
                "Continue regular monitoring",
                "Maintain current conservation efforts",
                "Document changes for long-term tracking"
            ])
        
        return {
            "vegetation_loss": vegetation_loss,
            "ndvi_change": ndvi_change,
            "affected_area": affected_area,
            "severity": severity,
            "changes": changes,
            "recommendations": recommendations,
            "location": location,
            "analysis_details": {
                "vegetation_before": comparison["vegetation_before"],
                "vegetation_after": comparison["vegetation_after"],
                "ndvi_before": comparison["ndvi_before"],
                "ndvi_after": comparison["ndvi_after"]
            }
        }
