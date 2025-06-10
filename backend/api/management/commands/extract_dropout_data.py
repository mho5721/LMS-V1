from django.core.management.base import BaseCommand
from django.utils.timezone import now
from api.models import User, EnrolledCourse, AssignmentSubmission, Question_Answer_Message, Note
import csv

class Command(BaseCommand):
    help = "Extract features for dropout prediction"

    def handle(self, *args, **kwargs):
        with open("dropout_data.csv", "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([
                "user_id", "days_since_last_login", "assignments_submitted",
                "discussions_participated", "note_count", "days_enrolled", "is_dropout"
            ])

            for user in User.objects.all():
                enrolled = EnrolledCourse.objects.filter(user=user).first()
                if not enrolled:
                    continue

                last_login = user.last_login or user.date_joined
                days_since_login = (now() - last_login).days
                days_enrolled = (now() - enrolled.date).days
                submissions = AssignmentSubmission.objects.filter(student=user).count()
                discussions = Question_Answer_Message.objects.filter(user=user).count()
                notes = Note.objects.filter(user=user).count()

                is_dropout = 1 if days_since_login > 14 and submissions == 0 and discussions == 0 else 0

                writer.writerow([
                    user.id, days_since_login, submissions, discussions, notes, days_enrolled, is_dropout
                ])

        self.stdout.write(self.style.SUCCESS("Exported dropout_data.csv"))
