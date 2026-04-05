"""
============================================================================
ML Model Training Script - Week 4
============================================================================

This script trains two machine learning models for lead scoring:
1. Logistic Regression - Fast, interpretable, linear model
2. Random Forest - More accurate, handles non-linear relationships

TRAINING DATA:
- Source: ../scripts/synthetic_leads_sigma10.json
- Features: emailOpens, websiteVisits, formFills, companySize, industry
- Target: actuallyConverted (binary: True/False)

MODELS SAVED TO:
- models/logistic_regression.pkl
- models/random_forest.pkl
- models/feature_encoder.pkl (for categorical features)

USAGE:
    python train_models.py
============================================================================
"""

import json
import pickle
import os
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, classification_report, confusion_matrix
)


class ModelTrainer:
    """
    Trains and evaluates ML models for lead scoring.
    """
    
    def __init__(self, data_path: str):
        """
        Initialize the trainer with path to training data.
        
        Args:
            data_path: Path to synthetic leads JSON file
        """
        self.data_path = data_path
        self.df = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        
        # Models
        self.lr_model = None
        self.rf_model = None
        
        # Encoders for categorical features
        self.company_size_encoder = LabelEncoder()
        self.industry_encoder = LabelEncoder()
        
        # Create models directory
        self.models_dir = Path(__file__).parent / "models"
        self.models_dir.mkdir(exist_ok=True)
    
    def load_data(self):
        """
        Load synthetic leads data from JSON file.
        """
        print(f"📂 Loading data from {self.data_path}...")
        
        with open(self.data_path, 'r') as f:
            data = json.load(f)
        
        # Extract leads array from JSON structure
        if isinstance(data, dict) and 'leads' in data:
            leads_data = data['leads']
        else:
            leads_data = data
        
        # Convert to DataFrame
        self.df = pd.DataFrame(leads_data)
        
        print(f"✅ Loaded {len(self.df)} leads")
        print(f"   Converted: {self.df['actuallyConverted'].sum()}")
        print(f"   Not converted: {(~self.df['actuallyConverted']).sum()}")
        print()
        
        return self
    
    def prepare_features(self):
        """
        Prepare features for model training.
        
        FEATURES:
        - emailOpens (numeric)
        - websiteVisits (numeric)
        - formFills (numeric)
        - companySize (categorical → encoded)
        - industry (categorical → encoded)
        
        TARGET:
        - actuallyConverted (binary)
        """
        print("🔧 Preparing features...")
        
        # Handle missing categorical values
        self.df['companySize'] = self.df['companySize'].fillna('UNKNOWN')
        self.df['industry'] = self.df['industry'].fillna('UNKNOWN')
        
        # Encode categorical features
        self.df['companySize_encoded'] = self.company_size_encoder.fit_transform(
            self.df['companySize']
        )
        self.df['industry_encoded'] = self.industry_encoder.fit_transform(
            self.df['industry']
        )
        
        # Select features
        feature_columns = [
            'emailOpens',
            'websiteVisits',
            'formFills',
            'companySize_encoded',
            'industry_encoded'
        ]
        
        X = self.df[feature_columns].values
        y = self.df['actuallyConverted'].values
        
        # Split into train/test (80/20)
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"✅ Features prepared")
        print(f"   Training samples: {len(self.X_train)}")
        print(f"   Test samples: {len(self.X_test)}")
        print(f"   Features: {len(feature_columns)}")
        print()
        
        return self
    
    def train_logistic_regression(self):
        """
        Train Logistic Regression model.
        
        HYPERPARAMETERS:
        - C=1.0 (regularization strength)
        - max_iter=1000 (maximum iterations)
        - random_state=42 (reproducibility)
        """
        print("🤖 Training Logistic Regression model...")
        
        self.lr_model = LogisticRegression(
            C=1.0,
            max_iter=1000,
            random_state=42,
            solver='lbfgs'
        )
        
        self.lr_model.fit(self.X_train, self.y_train)
        
        # Evaluate
        y_pred = self.lr_model.predict(self.X_test)
        y_proba = self.lr_model.predict_proba(self.X_test)[:, 1]
        
        print("✅ Logistic Regression trained")
        self._print_metrics("Logistic Regression", y_pred, y_proba)
        
        return self
    
    def train_random_forest(self):
        """
        Train Random Forest model.
        
        HYPERPARAMETERS:
        - n_estimators=100 (number of trees)
        - max_depth=10 (maximum tree depth)
        - min_samples_split=10 (minimum samples to split)
        - random_state=42 (reproducibility)
        """
        print("🌲 Training Random Forest model...")
        
        self.rf_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=10,
            random_state=42,
            n_jobs=-1  # Use all CPU cores
        )
        
        self.rf_model.fit(self.X_train, self.y_train)
        
        # Evaluate
        y_pred = self.rf_model.predict(self.X_test)
        y_proba = self.rf_model.predict_proba(self.X_test)[:, 1]
        
        print("✅ Random Forest trained")
        self._print_metrics("Random Forest", y_pred, y_proba)
        
        return self
    
    def _print_metrics(self, model_name: str, y_pred, y_proba):
        """
        Print evaluation metrics for a model.
        """
        accuracy = accuracy_score(self.y_test, y_pred)
        precision = precision_score(self.y_test, y_pred)
        recall = recall_score(self.y_test, y_pred)
        f1 = f1_score(self.y_test, y_pred)
        auc_roc = roc_auc_score(self.y_test, y_proba)
        
        print(f"\n📊 {model_name} Performance:")
        print(f"   Accuracy:  {accuracy:.4f}")
        print(f"   Precision: {precision:.4f}")
        print(f"   Recall:    {recall:.4f}")
        print(f"   F1 Score:  {f1:.4f}")
        print(f"   AUC-ROC:   {auc_roc:.4f}")
        print()
    
    def save_models(self):
        """
        Save trained models and encoders to disk.
        """
        print("💾 Saving models...")
        
        # Save Logistic Regression
        lr_path = self.models_dir / "logistic_regression.pkl"
        with open(lr_path, 'wb') as f:
            pickle.dump(self.lr_model, f)
        print(f"   ✅ Saved: {lr_path}")
        
        # Save Random Forest
        rf_path = self.models_dir / "random_forest.pkl"
        with open(rf_path, 'wb') as f:
            pickle.dump(self.rf_model, f)
        print(f"   ✅ Saved: {rf_path}")
        
        # Save encoders
        encoders = {
            'companySize': self.company_size_encoder,
            'industry': self.industry_encoder
        }
        encoders_path = self.models_dir / "encoders.pkl"
        with open(encoders_path, 'wb') as f:
            pickle.dump(encoders, f)
        print(f"   ✅ Saved: {encoders_path}")
        
        # Save metadata
        metadata = {
            'training_samples': len(self.X_train),
            'test_samples': len(self.X_test),
            'features': [
                'emailOpens',
                'websiteVisits',
                'formFills',
                'companySize_encoded',
                'industry_encoded'
            ],
            'companySize_classes': self.company_size_encoder.classes_.tolist(),
            'industry_classes': self.industry_encoder.classes_.tolist(),
        }
        metadata_path = self.models_dir / "metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        print(f"   ✅ Saved: {metadata_path}")
        
        print()
        return self
    
    def compare_models(self):
        """
        Compare both models side-by-side.
        """
        print("=" * 70)
        print("MODEL COMPARISON")
        print("=" * 70)
        
        # Logistic Regression
        lr_pred = self.lr_model.predict(self.X_test)
        lr_proba = self.lr_model.predict_proba(self.X_test)[:, 1]
        
        # Random Forest
        rf_pred = self.rf_model.predict(self.X_test)
        rf_proba = self.rf_model.predict_proba(self.X_test)[:, 1]
        
        # Metrics
        metrics = {
            'Logistic Regression': {
                'Accuracy': accuracy_score(self.y_test, lr_pred),
                'Precision': precision_score(self.y_test, lr_pred),
                'Recall': recall_score(self.y_test, lr_pred),
                'F1': f1_score(self.y_test, lr_pred),
                'AUC-ROC': roc_auc_score(self.y_test, lr_proba),
            },
            'Random Forest': {
                'Accuracy': accuracy_score(self.y_test, rf_pred),
                'Precision': precision_score(self.y_test, rf_pred),
                'Recall': recall_score(self.y_test, rf_pred),
                'F1': f1_score(self.y_test, rf_pred),
                'AUC-ROC': roc_auc_score(self.y_test, rf_proba),
            }
        }
        
        # Print comparison table
        print(f"\n{'Metric':<15} {'Logistic Reg':<15} {'Random Forest':<15} {'Winner':<10}")
        print("-" * 70)
        
        for metric_name in ['Accuracy', 'Precision', 'Recall', 'F1', 'AUC-ROC']:
            lr_val = metrics['Logistic Regression'][metric_name]
            rf_val = metrics['Random Forest'][metric_name]
            winner = 'LR' if lr_val > rf_val else 'RF' if rf_val > lr_val else 'Tie'
            
            print(f"{metric_name:<15} {lr_val:<15.4f} {rf_val:<15.4f} {winner:<10}")
        
        print("=" * 70)
        print()


def main():
    """
    Main training pipeline.
    """
    print("=" * 70)
    print("ML MODEL TRAINING - WEEK 4")
    print("=" * 70)
    print()
    
    # Path to synthetic data
    data_path = Path(__file__).parent.parent / "scripts" / "synthetic_leads_sigma10.json"
    
    if not data_path.exists():
        print(f"❌ Error: Training data not found at {data_path}")
        print("   Please ensure synthetic_leads_sigma10.json exists in scripts/")
        return
    
    # Train models
    trainer = ModelTrainer(str(data_path))
    trainer.load_data()
    trainer.prepare_features()
    trainer.train_logistic_regression()
    trainer.train_random_forest()
    trainer.compare_models()
    trainer.save_models()
    
    print("=" * 70)
    print("✅ TRAINING COMPLETE!")
    print("=" * 70)
    print()
    print("Next steps:")
    print("1. Restart the scoring service: docker-compose restart scoring")
    print("2. Test ML endpoints: POST http://localhost:8000/score/ml")
    print("3. Compare methods: POST http://localhost:8000/score/compare")
    print()


if __name__ == "__main__":
    main()
