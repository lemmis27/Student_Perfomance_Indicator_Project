from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model, UserMixin):
    """User model for authentication and profile management"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    active = db.Column(db.Boolean, default=True)
    
    # User authentication fields
    email = db.Column(db.String(255), nullable=False, unique=True)
    email_confirmed_at = db.Column(db.DateTime())
    password = db.Column(db.String(255), nullable=False)
    
    # User profile fields
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    user_type = db.Column(db.String(20), default='student')  # student, teacher, admin
    school_id = db.Column(db.Integer, db.ForeignKey('schools.id'))
    
    # Relationships
    predictions = db.relationship('Prediction', backref='user', lazy=True)
    student_profile = db.relationship('StudentProfile', backref='user', uselist=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class School(db.Model):
    """School model for managing educational institutions"""
    __tablename__ = 'schools'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    address = db.Column(db.Text)
    contact_email = db.Column(db.String(255))
    contact_phone = db.Column(db.String(50))
    
    # Relationships
    users = db.relationship('User', backref='school', lazy=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class StudentProfile(db.Model):
    """Extended student profile information"""
    __tablename__ = 'student_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Demographics
    gender = db.Column(db.String(20))
    ethnicity = db.Column(db.String(50))
    birth_date = db.Column(db.Date)
    
    # Academic info
    grade_level = db.Column(db.String(20))
    gpa = db.Column(db.Float)
    
    # Family background
    parental_education = db.Column(db.String(100))
    lunch_type = db.Column(db.String(50))
    
    # Test preparation
    test_prep_completed = db.Column(db.Boolean, default=False)
    test_prep_type = db.Column(db.String(100))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Prediction(db.Model):
    """Store prediction results and history"""
    __tablename__ = 'predictions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Input scores
    reading_score = db.Column(db.Integer, nullable=False)
    writing_score = db.Column(db.Integer, nullable=False)
    
    # Predicted scores
    predicted_math_score = db.Column(db.Float, nullable=False)
    
    # Additional predictions (for future enhancement)
    predicted_reading_score = db.Column(db.Float)
    predicted_writing_score = db.Column(db.Float)
    
    # Model metadata
    model_version = db.Column(db.String(50))
    confidence_score = db.Column(db.Float)
    
    # Contextual data (stored as JSON)
    demographic_data = db.Column(db.Text)  # JSON string
    recommendations = db.Column(db.Text)   # JSON string
    insights = db.Column(db.Text)          # JSON string
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_demographic_data(self, data):
        """Store demographic data as JSON"""
        self.demographic_data = json.dumps(data)
    
    def get_demographic_data(self):
        """Retrieve demographic data from JSON"""
        return json.loads(self.demographic_data) if self.demographic_data else {}
    
    def set_recommendations(self, recommendations):
        """Store recommendations as JSON"""
        self.recommendations = json.dumps(recommendations)
    
    def get_recommendations(self):
        """Retrieve recommendations from JSON"""
        return json.loads(self.recommendations) if self.recommendations else []
    
    def set_insights(self, insights):
        """Store insights as JSON"""
        self.insights = json.dumps(insights)
    
    def get_insights(self):
        """Retrieve insights from JSON"""
        return json.loads(self.insights) if self.insights else []

class ClassRoom(db.Model):
    """Classroom management for teachers"""
    __tablename__ = 'classrooms'
    
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    name = db.Column(db.String(100), nullable=False)
    subject = db.Column(db.String(100))
    grade_level = db.Column(db.String(20))
    academic_year = db.Column(db.String(20))
    
    # Relationships
    enrollments = db.relationship('Enrollment', backref='classroom', lazy=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Enrollment(db.Model):
    """Student enrollment in classrooms"""
    __tablename__ = 'enrollments'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    classroom_id = db.Column(db.Integer, db.ForeignKey('classrooms.id'), nullable=False)
    
    enrollment_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='active')  # active, inactive, withdrawn
    
    # Relationships
    student = db.relationship('User', backref='enrollments')

class ModelPerformance(db.Model):
    """Track model performance over time"""
    __tablename__ = 'model_performance'
    
    id = db.Column(db.Integer, primary_key=True)
    model_version = db.Column(db.String(50), nullable=False)
    
    # Performance metrics
    accuracy = db.Column(db.Float)
    mae = db.Column(db.Float)  # Mean Absolute Error
    rmse = db.Column(db.Float)  # Root Mean Square Error
    r2_score = db.Column(db.Float)
    
    # Training info
    training_samples = db.Column(db.Integer)
    training_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Feature importance (stored as JSON)
    feature_importance = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Feedback(db.Model):
    """User feedback on predictions"""
    __tablename__ = 'feedback'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    prediction_id = db.Column(db.Integer, db.ForeignKey('predictions.id'), nullable=False)
    
    # Feedback data
    actual_math_score = db.Column(db.Integer)  # Actual score received
    rating = db.Column(db.Integer)  # 1-5 star rating
    comments = db.Column(db.Text)
    
    # Usefulness ratings
    recommendations_helpful = db.Column(db.Boolean)
    insights_helpful = db.Column(db.Boolean)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class AuditLog(db.Model):
    """Audit log for tracking system activities"""
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    action = db.Column(db.String(100), nullable=False)
    resource_type = db.Column(db.String(50))
    resource_id = db.Column(db.Integer)
    
    details = db.Column(db.Text)  # Additional details as JSON
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(255))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Database initialization and utility functions
def init_db(app):
    """Initialize database with Flask app"""
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
        
        # Create default admin user if it doesn't exist
        if not User.query.filter_by(email='admin@example.com').first():
            admin_user = User(
                email='admin@example.com',
                password='password123',  # In production, use proper hashing
                first_name='Admin',
                last_name='User',
                user_type='admin',
                email_confirmed_at=datetime.utcnow()
            )
            db.session.add(admin_user)
            db.session.commit()

def create_sample_data():
    """Create sample data for testing"""
    # Create sample school
    school = School(
        name='Springfield High School',
        address='123 Main St, Springfield, IL',
        contact_email='info@springfield.edu',
        contact_phone='(555) 123-4567'
    )
    db.session.add(school)
    db.session.commit()
    
    # Create sample teacher
    teacher = User(
        email='teacher@example.com',
        password='teacher123',
        first_name='Jane',
        last_name='Smith',
        user_type='teacher',
        school_id=school.id,
        email_confirmed_at=datetime.utcnow()
    )
    db.session.add(teacher)
    db.session.commit()
    
    # Create sample student
    student = User(
        email='student@example.com',
        password='student123',
        first_name='John',
        last_name='Doe',
        user_type='student',
        school_id=school.id,
        email_confirmed_at=datetime.utcnow()
    )
    db.session.add(student)
    db.session.commit()
    
    # Create student profile
    student_profile = StudentProfile(
        user_id=student.id,
        gender='male',
        ethnicity='group A',
        grade_level='12',
        gpa=3.5,
        parental_education='bachelor\'s degree',
        lunch_type='standard',
        test_prep_completed=True
    )
    db.session.add(student_profile)
    db.session.commit()
    
    # Create sample classroom
    classroom = ClassRoom(
        teacher_id=teacher.id,
        name='Advanced Mathematics',
        subject='Mathematics',
        grade_level='12',
        academic_year='2024-2025'
    )
    db.session.add(classroom)
    db.session.commit()
    
    # Enroll student in classroom
    enrollment = Enrollment(
        student_id=student.id,
        classroom_id=classroom.id
    )
    db.session.add(enrollment)
    db.session.commit()

# Query helper functions
def get_user_predictions(user_id, limit=10):
    """Get recent predictions for a user"""
    return Prediction.query.filter_by(user_id=user_id)\
                          .order_by(Prediction.created_at.desc())\
                          .limit(limit).all()

def get_classroom_students(classroom_id):
    """Get all students in a classroom"""
    return db.session.query(User)\
                     .join(Enrollment)\
                     .filter(Enrollment.classroom_id == classroom_id)\
                     .filter(Enrollment.status == 'active').all()

def get_student_performance_trends(user_id):
    """Get performance trends for a student"""
    predictions = Prediction.query.filter_by(user_id=user_id)\
                                 .order_by(Prediction.created_at.asc()).all()
    
    return [{
        'date': p.created_at.strftime('%Y-%m-%d'),
        'math_score': p.predicted_math_score,
        'reading_score': p.reading_score,
        'writing_score': p.writing_score
    } for p in predictions]

def log_user_action(user_id, action, resource_type=None, resource_id=None, details=None):
    """Log user action to audit log"""
    audit_entry = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=json.dumps(details) if details else None
    )
    db.session.add(audit_entry)
    db.session.commit() 