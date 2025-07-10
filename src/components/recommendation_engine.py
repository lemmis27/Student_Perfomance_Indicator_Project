class RecommendationEngine:
    @staticmethod
    def generate_recommendations(student_data, predicted_math_score):
        recommendations = []
        if predicted_math_score < 60:
            recommendations.append({
                'category': 'Mathematics',
                'priority': 'high',
                'suggestion': 'Focus on fundamental math concepts and practice basic calculations daily',
                'resources': ['Khan Academy Math', 'Math tutoring sessions', 'Practice worksheets']
            })
            recommendations.append({
                'category': 'Mathematics',
                'priority': 'high',
                'suggestion': 'Consider enrolling in a math tutoring program or study group',
                'resources': ['Local tutoring centers', 'Peer study groups', 'Online math courses']
            })
        elif predicted_math_score < 80:
            recommendations.append({
                'category': 'Mathematics',
                'priority': 'medium',
                'suggestion': 'Practice advanced problem-solving and test-taking strategies',
                'resources': ['SAT/ACT prep books', 'Practice tests', 'Advanced math problems']
            })
        reading_score = student_data.get('reading_score', 0)
        if reading_score < 70:
            recommendations.append({
                'category': 'Reading',
                'priority': 'high',
                'suggestion': 'Improve reading comprehension through daily reading practice',
                'resources': ['Classic literature', 'Reading comprehension workbooks', 'Book clubs']
            })
        writing_score = student_data.get('writing_score', 0)
        if writing_score < 70:
            recommendations.append({
                'category': 'Writing',
                'priority': 'high',
                'suggestion': 'Enhance writing skills through regular practice and feedback',
                'resources': ['Writing workshops', 'Grammar guides', 'Peer review sessions']
            })
        if student_data.get('test_preparation_course') == 'none':
            recommendations.append({
                'category': 'Test Preparation',
                'priority': 'medium',
                'suggestion': 'Complete a test preparation course to improve overall performance',
                'resources': ['Kaplan test prep', 'Princeton Review', 'Online prep courses']
            })
        if student_data.get('lunch') == 'free/reduced':
            recommendations.append({
                'category': 'Academic Support',
                'priority': 'medium',
                'suggestion': 'Seek additional academic support resources available at your school',
                'resources': ['School counselors', 'Academic support centers', 'Free tutoring programs']
            })
        parental_ed = student_data.get('parental_education', '')
        if 'high school' in parental_ed and 'some' not in parental_ed:
            recommendations.append({
                'category': 'Academic Support',
                'priority': 'medium',
                'suggestion': 'Connect with mentors or academic advisors for college guidance',
                'resources': ['School counselors', 'College prep programs', 'Mentorship programs']
            })
        return recommendations

    @staticmethod
    def generate_insights(student_data, predicted_math_score):
        insights = []
        reading_score = student_data.get('reading_score', 0)
        writing_score = student_data.get('writing_score', 0)
        avg_score = (predicted_math_score + reading_score + writing_score) / 3
        if avg_score >= 80:
            insights.append({
                'type': 'positive',
                'message': 'Excellent overall performance! You\'re well-prepared for advanced coursework.',
                'icon': '🎉'
            })
        elif avg_score >= 70:
            insights.append({
                'type': 'neutral',
                'message': 'Good performance with room for improvement in weaker areas.',
                'icon': '👍'
            })
        else:
            insights.append({
                'type': 'improvement',
                'message': 'Focus on building stronger foundational skills across all subjects.',
                'icon': '📚'
            })
        if student_data.get('test_preparation_course') == 'completed':
            insights.append({
                'type': 'positive',
                'message': 'Test preparation has likely contributed to your performance. Keep up the good work!',
                'icon': '✅'
            })
        else:
            insights.append({
                'type': 'suggestion',
                'message': 'Consider test preparation courses to boost your scores significantly.',
                'icon': '📝'
            })
        scores = {
            'Mathematics': predicted_math_score,
            'Reading': reading_score,
            'Writing': writing_score
        }
        strongest_subject = max(scores, key=scores.get)
        insights.append({
            'type': 'strength',
            'message': f'Your strongest area appears to be {strongest_subject}. Leverage this strength!',
            'icon': '💪'
        })
        return insights 