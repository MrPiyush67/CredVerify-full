"""
Surya OCR for Certificate Text Extraction
Modern, accurate OCR specifically optimized for complex layouts
Surya is excellent for certificates with decorative elements and mixed fonts
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import logging
from datetime import datetime
import numpy as np
from PIL import Image

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class SuryaCertificateOCR:
    """
    Certificate OCR using Surya
    Surya is a modern OCR system with excellent multilingual support
    and robust handling of complex layouts
    """

    def __init__(self, langs=['en'], use_gpu=False):
        """
        Initialize Surya OCR

        Args:
            langs: List of language codes (default: ['en'] for English)
            use_gpu: Use GPU if available (faster but requires CUDA)
        """
        self.langs = langs
        self.use_gpu = use_gpu
        self.ocr_model = None
        self.det_model = None
        self.rec_model = None
        self.results = {}

        # Initialize Surya
        self._initialize_surya()

    def _initialize_surya(self):
        """Initialize Surya OCR models"""
        try:
            from surya.foundation import FoundationPredictor
            from surya.recognition import RecognitionPredictor
            from surya.detection import DetectionPredictor

            logger.info("Loading Surya OCR models (first time may take a while)...")

            # Initialize predictors
            self.foundation_predictor = FoundationPredictor()
            self.recognition_predictor = RecognitionPredictor(self.foundation_predictor)
            self.detection_predictor = DetectionPredictor()

            logger.info("✓ Surya OCR initialized successfully")

        except ImportError as e:
            logger.error("Surya OCR not installed. Install with: pip install surya-ocr")
            raise
        except Exception as e:
            logger.error(f"Error initializing Surya: {e}")
            raise

    def extract_text(self, image_path: str) -> Dict:
        """
        Extract text from certificate using Surya OCR

        Args:
            image_path: Path to certificate image

        Returns:
            Dictionary with OCR results including text, bounding boxes, and confidence
        """
        try:
            image_path = Path(image_path)

            if not image_path.exists():
                raise FileNotFoundError(f"Image not found: {image_path}")

            logger.info(f"\n{'='*70}")
            logger.info(f"Processing: {image_path.name}")
            logger.info(f"{'='*70}")

            # Load image
            logger.info("Loading image...")
            image = Image.open(image_path).convert("RGB")

            # Run Surya OCR
            logger.info("Running Surya OCR...")
            predictions = self.recognition_predictor(
                [image],
                det_predictor=self.detection_predictor
            )

            # Parse results
            result = predictions[0]

            # Extract all text blocks
            text_blocks = []
            full_text = ""

            for text_line in result.text_lines:
                text = text_line.text
                confidence = text_line.confidence if hasattr(text_line, 'confidence') else 1.0

                text_blocks.append({
                    'text': text,
                    'confidence': confidence * 100,  # Convert to percentage
                    'bbox': text_line.bbox if hasattr(text_line, 'bbox') else None
                })

                full_text += text + " "

            # Calculate average confidence
            avg_confidence = np.mean([block['confidence'] for block in text_blocks]) if text_blocks else 0

            ocr_result = {
                'engine': 'surya',
                'success': True,
                'full_text': full_text.strip(),
                'text_blocks': text_blocks,
                'avg_confidence': avg_confidence,
                'num_lines': len(text_blocks),
                'image_size': image.size
            }

            logger.info(f"✓ Extracted {len(text_blocks)} text lines")
            logger.info(f"✓ Average confidence: {avg_confidence:.2f}%")

            self.results = ocr_result
            return ocr_result

        except Exception as e:
            logger.error(f"Surya OCR failed: {e}")
            import traceback
            traceback.print_exc()
            return {
                'engine': 'surya',
                'success': False,
                'error': str(e)
            }

    def extract_text_with_layout(self, image_path: str) -> Dict:
        """
        Extract text with layout analysis
        Groups text by regions (title, body, footer, etc.)

        Args:
            image_path: Path to certificate image

        Returns:
            Dictionary with text organized by layout regions
        """
        try:
            from surya.layout import LayoutPredictor
            from surya.settings import settings

            image_path = Path(image_path)
            image = Image.open(image_path).convert("RGB")

            logger.info("Running layout detection...")

            # Create layout predictor
            layout_predictor = LayoutPredictor(
                FoundationPredictor(checkpoint=settings.LAYOUT_MODEL_CHECKPOINT)
            )

            # Detect layout regions
            layout_predictions = layout_predictor([image])

            # Run OCR
            ocr_predictions = self.recognition_predictor(
                [image],
                det_predictor=self.detection_predictor
            )

            # Organize by layout
            layout = layout_predictions[0] if layout_predictions else None
            ocr_result = ocr_predictions[0]

            regions = {
                'title': [],
                'body': [],
                'footer': [],
                'other': []
            }

            # Simple heuristic: top 20% = title, bottom 20% = footer, rest = body
            img_height = image.size[1]

            for text_line in ocr_result.text_lines:
                bbox = text_line.bbox if hasattr(text_line, 'bbox') else None
                if bbox:
                    y_center = (bbox[1] + bbox[3]) / 2

                    if y_center < img_height * 0.2:
                        regions['title'].append(text_line.text)
                    elif y_center > img_height * 0.8:
                        regions['footer'].append(text_line.text)
                    else:
                        regions['body'].append(text_line.text)
                else:
                    regions['body'].append(text_line.text)

            return {
                'engine': 'surya_layout',
                'success': True,
                'regions': regions,
                'full_text': ' '.join([text_line.text for text_line in ocr_result.text_lines])
            }

        except Exception as e:
            logger.error(f"Layout detection failed: {e}")
            import traceback
            traceback.print_exc()
            return {'success': False, 'error': str(e)}

    def extract_structured_data(self, text: str) -> Dict:
        """
        Extract structured information from certificate text

        Args:
            text: Raw OCR text

        Returns:
            Dictionary with extracted fields (name, course, instructor, date, etc.)
        """
        data = {
            'raw_text': text,
            'name': None,
            'course': None,
            'instructor': None,
            'date': None,
            'issuer': None
        }

        # Pattern for names (usually after "presented to" or "awarded to")
        name_patterns = [
            r'(?:presented to|awarded to|certifies that)\s+([A-Z][a-z]+(?: [A-Z][a-z]+)+)',
            r'(?:THIS CERTIFICATE.*?TO)\s+([A-Z][a-z]+(?: [A-Z][a-z]+)+)',
            r'(?:PRESENTED TO|AWARDED TO)\s+([A-Z][a-z]+(?: [A-Z][a-z]+)+)',
        ]

        for pattern in name_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                data['name'] = match.group(1).strip()
                break

        # Pattern for dates
        date_patterns = [
            r'(\d{4}/\d{1,2}/\d{1,2})',
            r'(\d{1,2}/\d{1,2}/\d{4})',
            r'([A-Z][a-z]+ \d{1,2},? \d{4})',
            r'(\d{1,2} [A-Z][a-z]+ \d{4})',
        ]

        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                data['date'] = match.group(1).strip()
                break

        # Pattern for instructor
        instructor_patterns = [
            r'Instructor[:\s]+([A-Za-z ]+?)(?:\s+Date|\s+\d{4}|$)',
            r'Taught by[:\s]+([A-Za-z ]+?)(?:\s+Date|\s+\d{4}|$)',
            r'Trainer[:\s]+([A-Za-z ]+?)(?:\s+Date|\s+\d{4}|$)',
        ]

        for pattern in instructor_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                data['instructor'] = match.group(1).strip()
                break

        # Pattern for course name
        course_patterns = [
            r'completing\s+(.+?)(?:Instructor|Date|on|$)',
            r'completion of\s+(.+?)(?:Instructor|Date|on|$)',
            r'successfully completed\s+(.+?)(?:Instructor|Date|on|$)',
            r'FOR COMPLETING\s+(.+?)(?:Instructor|Date|INSTRUCTOR|$)',
        ]

        for pattern in course_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                course = match.group(1).strip()
                # Clean up the course name
                course = re.sub(r'\s+', ' ', course)  # Remove extra whitespace
                course = course.split('\n')[0]  # Take first line if multiline
                data['course'] = course
                break

        # Pattern for issuer (domain names)
        issuer_patterns = [
            r'([a-zA-Z0-9-]+\.(?:com|org|edu|net))',
            r'(?:issued by|from|presented by)\s+([A-Z][a-z]+(?: [A-Z][a-z]+)*)',
        ]

        for pattern in issuer_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                data['issuer'] = match.group(1).strip()
                break

        return data

    def print_results(self):
        """Print OCR results in a formatted way"""
        if not self.results:
            print("No results available")
            return

        print("\n" + "="*70)
        print("SURYA OCR RESULTS")
        print("="*70)

        result = self.results

        if result.get('success'):
            print(f"\n✓ Successfully extracted {result['num_lines']} text lines")
            print(f"✓ Average confidence: {result['avg_confidence']:.2f}%")
            print(f"✓ Image size: {result['image_size']}")

            print(f"\n{'='*70}")
            print("EXTRACTED TEXT:")
            print(f"{'='*70}")
            print(result['full_text'])

            # Extract structured data
            structured = self.extract_structured_data(result['full_text'])

            print(f"\n{'='*70}")
            print("STRUCTURED DATA:")
            print(f"{'='*70}")
            print(f"📛 Name:       {structured.get('name', 'Not found')}")
            print(f"📚 Course:     {structured.get('course', 'Not found')}")
            print(f"👨‍🏫 Instructor: {structured.get('instructor', 'Not found')}")
            print(f"📅 Date:       {structured.get('date', 'Not found')}")
            print(f"🏢 Issuer:     {structured.get('issuer', 'Not found')}")

        else:
            print(f"\n✗ OCR Failed: {result.get('error', 'Unknown error')}")

    def save_results(self, output_path: str, include_structured=True):
        """
        Save OCR results to JSON file

        Args:
            output_path: Path to save JSON file
            include_structured: Include structured data extraction
        """
        if not self.results:
            logger.warning("No results to save")
            return

        output_data = {
            'timestamp': datetime.now().isoformat(),
            'engine': 'surya',
            'results': self.results
        }

        if include_structured and self.results.get('success'):
            output_data['structured_data'] = self.extract_structured_data(
                self.results['full_text']
            )

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)

        logger.info(f"✓ Results saved to: {output_path}")

    def visualize_detections(self, image_path: str, output_path: str = None):
        """
        Visualize detected text regions on the image

        Args:
            image_path: Path to original image
            output_path: Path to save annotated image (optional)
        """
        try:
            import cv2
            import numpy as np
            from PIL import ImageDraw, ImageFont

            image = Image.open(image_path).convert("RGB")
            draw = ImageDraw.Draw(image)

            if not self.results or not self.results.get('text_blocks'):
                logger.warning("No text blocks to visualize")
                return

            # Draw bounding boxes and text
            for block in self.results['text_blocks']:
                bbox = block['bbox']
                confidence = block['confidence']

                # Draw rectangle
                color = (0, 255, 0) if confidence > 80 else (255, 165, 0) if confidence > 60 else (255, 0, 0)
                draw.rectangle(bbox, outline=color, width=2)

                # Draw confidence score
                draw.text((bbox[0], bbox[1] - 10), f"{confidence:.1f}%", fill=color)

            if output_path:
                image.save(output_path)
                logger.info(f"✓ Visualization saved to: {output_path}")
            else:
                image.show()

        except Exception as e:
            logger.error(f"Visualization failed: {e}")


def main():
    """Main function for command-line usage"""
    import argparse

    parser = argparse.ArgumentParser(
        description='Surya OCR for Certificate Text Extraction',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic usage
  python certificate_ocr_surya.py certificate.jpg

  # Save results to custom location
  python certificate_ocr_surya.py certificate.jpg --output results.json

  # Visualize text detections
  python certificate_ocr_surya.py certificate.jpg --visualize annotated.jpg

  # Use multiple languages
  python certificate_ocr_surya.py certificate.jpg --langs en,hi
        """
    )

    parser.add_argument('image_path', help='Path to certificate image')
    parser.add_argument('--langs', default='en', help='Language codes (comma-separated, e.g., en,hi,es)')
    parser.add_argument('--output', '-o', help='Output JSON file path')
    parser.add_argument('--visualize', '-v', help='Save visualization to this path')
    parser.add_argument('--gpu', action='store_true', help='Use GPU if available')

    args = parser.parse_args()

    # Parse languages
    langs = [lang.strip() for lang in args.langs.split(',')]

    # Initialize OCR
    logger.info("Initializing Surya OCR...")
    ocr = SuryaCertificateOCR(langs=langs, use_gpu=args.gpu)

    # Extract text
    logger.info(f"Processing: {args.image_path}")
    ocr.extract_text(args.image_path)

    # Print results
    ocr.print_results()

    # Save results
    output_path = args.output or Path(args.image_path).stem + '_surya_results.json'
    ocr.save_results(output_path)

    # Visualize if requested
    if args.visualize:
        ocr.visualize_detections(args.image_path, args.visualize)


if __name__ == "__main__":
    main()
