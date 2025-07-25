from django.shortcuts import render, redirect
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.contrib.auth.hashers import check_password
from django.db import models
from django.db.models.functions import ExtractMonth
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.utils.timezone import now, timedelta



from api import serializer as api_serializer
from api import models as api_models
from userauths.models import User, Profile

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics, status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.decorators import api_view, APIView, permission_classes



import random
from decimal import Decimal
import requests
from datetime import datetime, timedelta
from distutils.util import strtobool
import jwt


# Updates
from django.core.files.storage import default_storage
import os
from moviepy.editor import VideoFileClip
from django.core.files.base import ContentFile
import math
from rest_framework.parsers import MultiPartParser, FormParser
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from django.db.models import Max

import joblib
import numpy as np

from django.contrib.auth.models import update_last_login

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = api_serializer.MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.user

        update_last_login(None, user)

        # Return token response
        return Response(serializer.validated_data, status=200)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = api_serializer.RegisterSerializer

def generate_random_otp(length=7):
    otp = ''.join([str(random.randint(0, 9)) for _ in range(length)])
    return otp

class PasswordResetEmailVerifyAPIView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = api_serializer.UserSerializer

    def get_object(self):
        email = self.kwargs['email'] # api/v1/password-email-verify/desphixs@gmail.com/

        user = User.objects.filter(email=email).first()

        if user:
            uuidb64 = user.pk
            refresh = RefreshToken.for_user(user)
            refresh_token = str(refresh.access_token)

            user.refresh_token = refresh_token
            user.otp = generate_random_otp()
            user.save()

            link = f"http://localhost:5173/create-new-password/?otp={user.otp}&uuidb64={uuidb64}&refresh_token={refresh_token}"

            context = {
                "link": link,
                "username": user.username
            }

            subject = "Password Rest Email"
            text_body = render_to_string("email/password_reset.txt", context)
            html_body = render_to_string("email/password_reset.html", context)

            msg = EmailMultiAlternatives(
                subject=subject,
                from_email=settings.FROM_EMAIL,
                to=[user.email],
                body=text_body
            )

            msg.attach_alternative(html_body, "text/html")
            msg.send()

            print("link ======", link)
        return user
    
class PasswordChangeAPIView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = api_serializer.UserSerializer

    def create(self, request, *args, **kwargs):
        otp = request.data['otp']
        uuidb64 = request.data['uuidb64']
        password = request.data['password']

        user = User.objects.get(id=uuidb64, otp=otp)
        if user:
            user.set_password(password)
            # user.otp = ""
            user.save()

            return Response({"message": "Password Changed Successfully"}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "User Does Not Exists"}, status=status.HTTP_404_NOT_FOUND)

class ChangePasswordAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        old_password = request.data['old_password']
        new_password = request.data['new_password']

        user = User.objects.get(id=user_id)
        if user is not None:
            if check_password(old_password, user.password):
                user.set_password(new_password)
                user.save()
                return Response({"message": "Password changed successfully", "icon": "success"})
            else:
                return Response({"message": "Old password is incorrect", "icon": "warning"})
        else:
            return Response({"message": "User does not exists", "icon": "error"})

class ProfileAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ProfileSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        try:
            user_id = self.kwargs['user_id']
            user = User.objects.get(id=user_id)
            return Profile.objects.get(user=user)
        except:
            return None

class CategoryListAPIView(generics.ListAPIView):
    queryset = api_models.Category.objects.filter(active=True)  
    serializer_class = api_serializer.CategorySerializer
    permission_classes = [AllowAny]

class CourseListAPIView(generics.ListAPIView):
    queryset = api_models.Course.objects.filter(platform_status="Published", teacher_course_status="Published")
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

class TeacherCourseDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]
    queryset = api_models.Course.objects.filter(platform_status="Published", teacher_course_status="Published")

    def get_object(self):
        course_id = self.kwargs['course_id']
        course = api_models.Course.objects.get(course_id=course_id, platform_status="Published", teacher_course_status="Published")
        return course
    
    
class StudentSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.StudentSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)

        active_courses = api_models.EnrolledCourse.objects.filter(user=user).count()
        notes_created = api_models.Note.objects.filter(user=user).count()
        assignments_submitted = api_models.AssignmentSubmission.objects.filter(student=user).count()


        return [{
            "active_courses": active_courses,
            "notes_created": notes_created,
            "assignments_submitted": assignments_submitted,
        }]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
class StudentCourseListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.EnrolledCourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user =  User.objects.get(id=user_id)
        return api_models.EnrolledCourse.objects.filter(user=user)

class StudentCourseDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.EnrolledCourseSerializer
    permission_classes = [AllowAny]
    lookup_field = 'enrollment_id'

    def get_object(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']

        user = User.objects.get(id=user_id)
        return api_models.EnrolledCourse.objects.get(user=user, enrollment_id=enrollment_id)
        
class StudentCourseCompletedCreateAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CompletedLessonSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        course_id = request.data['course_id']
        variant_item_id = request.data['variant_item_id']

        user = User.objects.get(id=user_id)
        course = api_models.Course.objects.get(id=course_id)
        variant_item = api_models.VariantItem.objects.get(variant_item_id=variant_item_id)

        completed_lessons = api_models.CompletedLesson.objects.filter(user=user, course=course, variant_item=variant_item).first()

        if completed_lessons:
            completed_lessons.delete()
            return Response({"message": "Course marked as not completed"})

        else:
            api_models.CompletedLesson.objects.create(user=user, course=course, variant_item=variant_item)
            return Response({"message": "Course marked as completed"})

class StudentNoteCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.NoteSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']

        user = User.objects.get(id=user_id)
        enrolled = api_models.EnrolledCourse.objects.get(enrollment_id=enrollment_id)
        
        return api_models.Note.objects.filter(user=user, course=enrolled.course)

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        enrollment_id = request.data['enrollment_id']
        title = request.data['title']
        note = request.data['note']

        user = User.objects.get(id=user_id)
        enrolled = api_models.EnrolledCourse.objects.get(enrollment_id=enrollment_id)
        
        api_models.Note.objects.create(user=user, course=enrolled.course, note=note, title=title)

        return Response({"message": "Note created successfullly"}, status=status.HTTP_201_CREATED)

class StudentNoteDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']
        note_id = self.kwargs['note_id']

        user = User.objects.get(id=user_id)
        enrolled = api_models.EnrolledCourse.objects.get(enrollment_id=enrollment_id)
        note = api_models.Note.objects.get(user=user, course=enrolled.course, id=note_id)
        return note


class StudentRateCourseUpdateAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        review_id = self.kwargs['review_id']

        user = User.objects.get(id=user_id)
        return api_models.Review.objects.get(id=review_id, user=user)

class StudentWishListListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.WishlistSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)
        return api_models.Wishlist.objects.filter(user=user)
    
    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        course_id = request.data['course_id']

        user = User.objects.get(id=user_id)
        course = api_models.Course.objects.get(id=course_id)

        wishlist = api_models.Wishlist.objects.filter(user=user, course=course).first()
        if wishlist:
            wishlist.delete()
            return Response({"message": "Wishlist Deleted"}, status=status.HTTP_200_OK)
        else:
            api_models.Wishlist.objects.create(
                user=user, course=course
            )
            return Response({"message": "Wishlist Created"}, status=status.HTTP_201_CREATED)

class QuestionAnswerListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.Question_AnswerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        course_id = self.kwargs['course_id']
        course = api_models.Course.objects.get(id=course_id)
        return api_models.Question_Answer.objects.filter(course=course)
    
    def create(self, request, *args, **kwargs):
        course_id = request.data['course_id']
        user_id = request.data['user_id']
        title = request.data['title']
        message = request.data['message']

        user = User.objects.get(id=user_id)
        course = api_models.Course.objects.get(id=course_id)
        
        question = api_models.Question_Answer.objects.create(
            course=course,
            user=user,
            title=title
        )

        api_models.Question_Answer_Message.objects.create(
            course=course,
            user=user,
            message=message,
            question=question
        )
        
        return Response({"message": "Group conversation Started"}, status=status.HTTP_201_CREATED)

class QuestionAnswerMessageSendAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.Question_Answer_MessageSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        course_id = request.data['course_id']
        qa_id = request.data['qa_id']
        user_id = request.data['user_id']
        message = request.data['message']

        user = User.objects.get(id=user_id)
        course = api_models.Course.objects.get(id=course_id)
        question = api_models.Question_Answer.objects.get(qa_id=qa_id)
        api_models.Question_Answer_Message.objects.create(
            course=course,
            user=user,
            message=message,
            question=question
        )

        question_serializer = api_serializer.Question_AnswerSerializer(question)
        return Response({"messgae": "Message Sent", "question": question_serializer.data})

class TeacherSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.TeacherSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)

        one_month_ago = datetime.today() - timedelta(days=28)

        total_courses = api_models.Course.objects.filter(teacher=teacher).count()
        
        enrolled_courses = api_models.EnrolledCourse.objects.filter(teacher=teacher)
        unique_student_ids = set()
        
        # Count at-risk predictions for this teacher's students in last 24h
        recent = now() - timedelta(days=1)
        at_risk_count = api_models.DropoutPrediction.objects.filter(
            user_id__in=unique_student_ids,
            score__gt=0.7,
            predicted_at__gte=recent
        ).values("user_id").distinct().count()

        
        students = []

        for course in enrolled_courses:
            if course.user_id not in unique_student_ids:
                user = User.objects.get(id=course.user_id)
                student = {
                    "full_name": user.full_name,
                    "image": user.profile.image.url,
                    "country": user.profile.country,
                    "date": course.date
                }

                students.append(student)
                unique_student_ids.add(course.user_id)

        return [{
            "total_courses": total_courses,
            "total_students": len(students),
            "at_risk_students": at_risk_count,
        }]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class TeacherCourseListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Course.objects.filter(teacher=teacher)

class TeacherReviewListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Review.objects.filter(course__teacher=teacher)
    
class TeacherReviewDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        review_id = self.kwargs['review_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Review.objects.get(course__teacher=teacher, id=review_id)

class TeacherStudentsListAPIVIew(viewsets.ViewSet):
    
    def list(self, request, teacher_id=None):
        teacher = api_models.Teacher.objects.get(id=teacher_id)

        enrolled_courses = api_models.EnrolledCourse.objects.filter(teacher=teacher)
        unique_student_ids = set()
        students = []

        for course in enrolled_courses:
            if course.user_id not in unique_student_ids:
                user = User.objects.get(id=course.user_id)
                student = {
                    "full_name": user.full_name,
                    "image": user.profile.image.url,
                    "country": user.profile.country,
                    "date": course.date
                }

                students.append(student)
                unique_student_ids.add(course.user_id)

        return Response(students)


    

class TeacherQuestionAnswerListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.Question_AnswerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Question_Answer.objects.filter(course__teacher=teacher)
    
    
    
class TeacherNotificationListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.NotificationSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Notification.objects.filter(teacher=teacher, seen=False)
    
class TeacherNotificationDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.NotificationSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        noti_id = self.kwargs['noti_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Notification.objects.get(teacher=teacher, id=noti_id)
    

class CourseCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        title = request.data.get("title")
        description = request.data.get("description")
        level = request.data.get("level")
        language = request.data.get("language")
        price = request.data.get("price")
        category_id = request.data.get("category")

        file = request.FILES.get("file")
        image = request.FILES.get("image")

        category = api_models.Category.objects.filter(id=category_id).first()
        teacher = api_models.Teacher.objects.get(user=request.user)

        course = api_models.Course.objects.create(
            teacher=teacher,
            category=category,
            title=title,
            description=description,
            level=level,
            language=language,
            price=price,
            file=file,
            image=image,
        )

        return Response({
            "message": "Course created successfully",
            "course_id": course.course_id
        }, status=status.HTTP_201_CREATED)


class CourseUpdateAPIView(generics.RetrieveUpdateAPIView):
    querysect = api_models.Course.objects.all()
    serializer_class = api_serializer.CourseSerializer
    permisscion_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']

        teacher = api_models.Teacher.objects.get(id=teacher_id)
        course = api_models.Course.objects.get(course_id=course_id)

        return course
    
    def update(self, request, *args, **kwargs):
        course = self.get_object()
        serializer = self.get_serializer(course, data=request.data)
        serializer.is_valid(raise_exception=True)

        if "image" in request.data and isinstance(request.data['image'], InMemoryUploadedFile):
            course.image = request.data['image']
        elif 'image' in request.data and str(request.data['image']) == "No File":
            course.image = None
        
        if 'file' in request.data and not str(request.data['file']).startswith("http://"):
            course.file = request.data['file']

        if 'category' in request.data and request.data['category'] not in ('NaN', 'undefined', ''):
            try:
                category = api_models.Category.objects.get(id=request.data['category'])
                course.category = category
            except api_models.Category.DoesNotExist:
                pass  # or handle category not found if needed


        self.perform_update(serializer)
        self.update_variant(course, request.data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def update_variant(self, course, request_data):
        for key, value in request_data.items():
            if key.startswith("variants") and '[variant_title]' in key:

                index = key.split('[')[1].split(']')[0]
                title = value

                id_key = f"variants[{index}][variant_id]"
                variant_id = request_data.get(id_key)

                variant_data = {'title': title}
                item_data_list = []
                current_item = {}

                for item_key, item_value in request_data.items():
                    if f'variants[{index}][items]' in item_key:
                        field_name = item_key.split('[')[-1].split(']')[0]
                        if field_name == "title":
                            if current_item:
                                item_data_list.append(current_item)
                            current_item = {}
                        current_item.update({field_name: item_value})
                    
                if current_item:
                    item_data_list.append(current_item)

                existing_variant = course.variant_set.filter(id=variant_id).first()

                if existing_variant:
                    existing_variant.title = title
                    existing_variant.save()

                    for item_data in item_data_list[1:]:
                        preview_value = item_data.get("preview")
                        preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

                        variant_item = api_models.VariantItem.objects.filter(variant_item_id=item_data.get("variant_item_id")).first()

                        if not str(item_data.get("file")).startswith("http://"):
                            if item_data.get("file") != "null":
                                file = item_data.get("file")
                            else:
                                file = None
                            
                            title = item_data.get("title")
                            description = item_data.get("description")

                            if variant_item:
                                variant_item.title = title
                                variant_item.description = description
                                variant_item.file = file
                                variant_item.preview = preview
                            else:
                                variant_item = api_models.VariantItem.objects.create(
                                    variant=existing_variant,
                                    title=title,
                                    description=description,
                                    file=file,
                                    preview=preview
                                )
                        
                        else:
                            title = item_data.get("title")
                            description = item_data.get("description")

                            if variant_item:
                                variant_item.title = title
                                variant_item.description = description
                                variant_item.preview = preview
                            else:
                                variant_item = api_models.VariantItem.objects.create(
                                    variant=existing_variant,
                                    title=title,
                                    description=description,
                                    preview=preview
                                )
                        
                        variant_item.save()

                else:
                    new_variant = api_models.Variant.objects.create(
                        course=course, title=title
                    )

                    for item_data in item_data_list:
                        preview_value = item_data.get("preview")
                        preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

                        api_models.VariantItem.objects.create(
                            variant=new_variant,
                            title=item_data.get("title"),
                            description=item_data.get("description"),
                            file=item_data.get("file"),
                            preview=preview,
                        )

    def save_nested_data(self, course_instance, serializer_class, data):
        serializer = serializer_class(data=data, many=True, context={"course_instance": course_instance})
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course_instance) 

class CourseDetailAPIView(generics.RetrieveDestroyAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        slug = self.kwargs['slug']
        return api_models.Course.objects.get(slug=slug)

class CourseVariantDeleteAPIView(generics.DestroyAPIView):
    serializer_class = api_serializer.VariantSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        variant_id = self.kwargs['variant_id']
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']

        print("variant_id ========", variant_id)

        teacher = api_models.Teacher.objects.get(id=teacher_id)
        course = api_models.Course.objects.get(teacher=teacher, course_id=course_id)
        return api_models.Variant.objects.get(id=variant_id)
    
class CourseVariantItemDeleteAPIVIew(generics.DestroyAPIView):

    serializer_class = api_serializer.VariantItemSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        variant_id = self.kwargs['variant_id']
        variant_item_id = self.kwargs['variant_item_id']
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']


        teacher = api_models.Teacher.objects.get(id=teacher_id)
        course = api_models.Course.objects.get(teacher=teacher, course_id=course_id)
        variant = api_models.Variant.objects.get(variant_id=variant_id, course=course)
        return api_models.VariantItem.objects.get(variant=variant, variant_item_id=variant_item_id)
    

class FileUploadAPIView(APIView):
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser,)  # Allow file uploads

    @swagger_auto_schema(
        operation_description="Upload a file",
        request_body=api_serializer.FileUploadSerializer,  # Use the serializer here
        responses={
            200: openapi.Response('File uploaded successfully', openapi.Schema(type=openapi.TYPE_OBJECT)),
            400: openapi.Response('No file provided', openapi.Schema(type=openapi.TYPE_OBJECT)),
        }
    )

    def post(self, request):
        
        serializer = api_serializer.FileUploadSerializer(data=request.data)  

        if serializer.is_valid():
            file = serializer.validated_data.get("file")

            # Save the file to the media directory
            file_path = default_storage.save(file.name, ContentFile(file.read()))
            file_url = request.build_absolute_uri(default_storage.url(file_path))

            # Check if the file is a video by inspecting its extension
            if file.name.endswith(('.mp4', '.avi', '.mov', '.mkv')):
                # Calculate the video duration
                file_full_path = os.path.join(default_storage.location, file_path)
                clip = VideoFileClip(file_full_path)
                duration_seconds = clip.duration

                # Calculate minutes and seconds
                minutes, remainder = divmod(duration_seconds, 60)
                minutes = math.floor(minutes)
                seconds = math.floor(remainder)

                duration_text = f"{minutes}m {seconds}s"

                print("url ==========", file_url)
                print("duration_seconds ==========", duration_seconds)

                # Return both the file URL and the video duration
                return Response({
                    "url": file_url,
                    "video_duration": duration_text
                })

            # If not a video, just return the file URL
            return Response({
                    "url": file_url,
            })

        return Response({"error": "No file provided"}, status=400)

# Upload new course material
class CourseMaterialCreateView(generics.CreateAPIView):
    queryset = api_models.CourseMaterial.objects.all()
    serializer_class = api_serializer.CourseMaterialSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        course_id = self.request.data.get('course')
        course = api_models.Course.objects.get(course_id=course_id)  # <-- important: using course_id
        serializer.save(course=course)


# List all materials by course
class CourseMaterialListView(generics.ListAPIView):
    serializer_class = api_serializer.CourseMaterialSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        course = api_models.Course.objects.get(course_id=course_id)
        return api_models.CourseMaterial.objects.filter(course=course)


# Delete a course material
class CourseMaterialDeleteView(generics.DestroyAPIView):
    queryset = api_models.CourseMaterial.objects.all()
    serializer_class = api_serializer.CourseMaterialSerializer
    permission_classes = [IsAuthenticated]
    

class StudyGroupViewSet(viewsets.ModelViewSet):
    queryset = api_models.StudyGroup.objects.all()
    serializer_class = api_serializer.StudyGroupSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        group = serializer.save(created_by=self.request.user)
        api_models.StudyGroupMember.objects.get_or_create(user=self.request.user, group=group)



class GroupMessageViewSet(viewsets.ModelViewSet):
    queryset = api_models.GroupMessage.objects.all()  #  Required for DRF router
    serializer_class = api_serializer.GroupMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        group_id = self.request.query_params.get("group")
        if not group_id:
            return api_models.GroupMessage.objects.none()

        group = api_models.StudyGroup.objects.get(id=group_id)
        is_creator = group.created_by == self.request.user
        is_member = api_models.StudyGroupMember.objects.filter(group_id=group_id, user=self.request.user).exists()

        if not (is_creator or is_member):
            return api_models.GroupMessage.objects.none()


        return api_models.GroupMessage.objects.filter(group_id=group_id)

    


class StudyGroupMemberViewSet(viewsets.ModelViewSet):
    queryset = api_models.StudyGroupMember.objects.all() 
    serializer_class = api_serializer.StudyGroupMemberSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        group_id = self.request.query_params.get("group")
        user_id = self.request.query_params.get("user")

        if group_id:
            group = api_models.StudyGroup.objects.get(id=group_id)
            is_creator = group.created_by == self.request.user
            is_member = api_models.StudyGroupMember.objects.filter(group_id=group_id, user=self.request.user).exists()

            if not (is_creator or is_member):
                return api_models.StudyGroupMember.objects.none()

            return api_models.StudyGroupMember.objects.filter(group_id=group_id)

        if user_id:
            return api_models.StudyGroupMember.objects.filter(user__id=user_id)

        return api_models.StudyGroupMember.objects.none()




class SearchCourseAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        query = self.request.GET.get('query')
        return api_models.Course.objects.filter(title__icontains=query, platform_status="Published", teacher_course_status="Published")
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def available_study_groups(request, user_id):
    course_id = request.GET.get("course_id")
    user = User.objects.get(id=user_id)

    # Groups not yet joined
    joined_ids = api_models.StudyGroupMember.objects.filter(user=user).values_list("group_id", flat=True)
    created_ids = api_models.StudyGroup.objects.filter(created_by=user).values_list("id", flat=True)
    excluded_ids = list(joined_ids) + list(created_ids)

    groups = api_models.StudyGroup.objects.filter(
        course__id=course_id
    ).exclude(id__in=excluded_ids)



    serializer = api_serializer.StudyGroupSerializer(groups, many=True)
    return Response(serializer.data)

@api_view(["POST"])
def join_study_group(request):
    user_id = request.data.get("user_id")
    group_id = request.data.get("group_id")

    try:
        group = api_models.StudyGroup.objects.get(id=group_id)
        user = User.objects.get(id=user_id)

        # Prevent duplicate joins
        if api_models.StudyGroupMember.objects.filter(group=group, user=user).exists():
            return Response({"detail": "Already a member"}, status=status.HTTP_400_BAD_REQUEST)

        api_models.StudyGroupMember.objects.create(group=group, user=user)
        return Response({"detail": "Joined successfully"}, status=status.HTTP_201_CREATED)

    except (api_models.StudyGroup.DoesNotExist, User.DoesNotExist):
        return Response({"detail": "Group or user not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
def leave_study_group(request):
    user_id = request.data.get("user_id")
    group_id = request.data.get("group_id")

    try:
        group = api_models.StudyGroup.objects.get(id=group_id)
        user = User.objects.get(id=user_id)
        membership = api_models.StudyGroupMember.objects.get(group=group, user=user)
        membership.delete()
        return Response({"detail": "Left the group"}, status=status.HTTP_200_OK)

    except api_models.StudyGroupMember.DoesNotExist:
        return Response({"detail": "You are not a member of this group"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
def remove_member(request):
    user_id = request.data.get("user_id")
    group_id = request.data.get("group_id")
    requester_id = request.data.get("requester_id")

    try:
        group = api_models.StudyGroup.objects.get(id=group_id)
        requester = User.objects.get(id=requester_id)
        target = User.objects.get(id=user_id)

        if group.created_by != requester:
            return Response({"detail": "Only the group creator can remove members"}, status=status.HTTP_403_FORBIDDEN)

        api_models.StudyGroupMember.objects.get(group=group, user=target).delete()
        return Response({"detail": "Member removed"}, status=status.HTTP_200_OK)

    except (api_models.StudyGroup.DoesNotExist, User.DoesNotExist, api_models.StudyGroupMember.DoesNotExist):
        return Response({"detail": "Error removing member"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_study_group(request, group_id):
    group = api_models.StudyGroup.objects.get(id=group_id)

    if group.created_by_id != request.user.id:
        return Response({"error": "Only the creator can delete the group"}, status=403)

    group.delete()
    return Response({"message": "Study group deleted"})

class InstructorCourseFullDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id, course_id):
        user = User.objects.get(id=user_id)
        course = api_models.Course.objects.get(course_id=course_id)

        completed_lessons = api_models.CompletedLesson.objects.filter(user=user, course=course)
        notes = api_models.Note.objects.filter(user=user, course=course)
        review = api_models.Review.objects.filter(user=user, course=course).first()
        questions = api_models.Question_Answer.objects.filter(course=course)

        course_data = api_serializer.CourseSerializer(course, context={"request": request}).data
        return Response({
            "course": course_data,
            "completed_lesson": api_serializer.CompletedLessonSerializer(completed_lessons, many=True).data,
            "note": api_serializer.NoteSerializer(notes, many=True).data,
            "review": api_serializer.ReviewSerializer(review).data if review else None,
            "question_answer": api_serializer.Question_AnswerSerializer(questions, many=True).data
        })

class InstructorNoteCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.NoteSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.request.query_params.get("user_id")
        course_id = self.request.query_params.get("course_id")
        return api_models.Note.objects.filter(user__id=user_id, course__course_id=course_id)

    def create(self, request, *args, **kwargs):
        user = User.objects.get(id=request.data["user_id"])
        course = api_models.Course.objects.get(id=request.data["course_id"])
        note = api_models.Note.objects.create(
            user=user,
            course=course,
            title=request.data["title"],
            note=request.data["note"]
        )
        return Response({"message": "Note created", "id": note.id}, status=status.HTTP_201_CREATED)

class InstructorNoteDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.NoteSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs["user_id"]
        course_id = self.kwargs["course_id"]  # This is numeric
        note_id = self.kwargs["note_id"]
        return api_models.Note.objects.get(user__id=user_id, course__id=course_id, id=note_id)


class StudentCourseAssignmentAPIView(generics.ListAPIView):
    serializer_class = api_serializer.AssignmentSerializer

    def get_queryset(self):
        course_id = self.kwargs.get("course_id")
        return api_models.Assignment.objects.filter(course__id=course_id)

class AssignmentSubmissionCreateAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.AssignmentSubmissionSerializer
    permission_classes = [AllowAny]

class StudentAssignmentSubmissionsAPIView(generics.ListAPIView):
    serializer_class = api_serializer.AssignmentSubmissionSerializer

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")
        return api_models.AssignmentSubmission.objects.filter(student__id=user_id)
    
    def create(self, request, *args, **kwargs):
        print("== DEBUG DATA ==")
        print("request.data:", request.data)
        print("request.FILES:", request.FILES)
        return super().create(request, *args, **kwargs)
    
    def post(self, request, *args, **kwargs):
        student_id = request.data.get("student")
        assignment_id = request.data.get("assignment")

        try:
            submission = api_models.AssignmentSubmission.objects.get(student_id=student_id, assignment_id=assignment_id)
            serializer = self.get_serializer(submission, data=request.data, partial=True)
        except api_models.AssignmentSubmission.DoesNotExist:
            serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

class InstructorAssignmentListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.AssignmentSerializer

    def get_queryset(self):
        course_id = self.kwargs["course_id"]
        return api_models.Assignment.objects.filter(course__course_id=course_id)

    def perform_create(self, serializer):
        course_id = self.request.data.get("course")
        course = api_models.Course.objects.get(id=course_id)
        serializer.save(course=course)
        print("Creating assignment for course:", self.request.data.get("course"))

# View & Grade submissions
class InstructorAssignmentSubmissionsAPIView(generics.ListAPIView):
    serializer_class = api_serializer.AssignmentSubmissionSerializer

    def get_queryset(self):
        assignment_id = self.kwargs["assignment_id"]

        # Get latest submission id per student
        latest_ids = (
            api_models.AssignmentSubmission.objects
            .filter(assignment_id=assignment_id)
            .values("student_id")
            .annotate(latest_id=Max("id"))
            .values_list("latest_id", flat=True)
        )

        return api_models.AssignmentSubmission.objects.filter(id__in=latest_ids)
    
# Grade a specific submission
class GradeAssignmentAPIView(generics.UpdateAPIView):
    serializer_class = api_serializer.AssignmentSubmissionSerializer
    queryset = api_models.AssignmentSubmission.objects.all()
    lookup_field = "id"


model = joblib.load("api/ml_models/dropout_model.pkl")


class DropoutRiskAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = api_serializer.DropoutRiskInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        data = serializer.validated_data

        try:
            features = np.array([
                data["days_since_last_login"],
                data["assignments_submitted"],
                data["discussions_participated"],
                data["note_count"],
                data["days_enrolled"]
            ]).reshape(1, -1)

            risk = model.predict_proba(features)[0][1]
            return Response({"dropout_risk_score": round(risk, 2)})

        except Exception as e:
            return Response({"error": str(e)}, status=500)

class TeacherAnalyticsAPIView(APIView):
    def get(self, request, teacher_id):
        try:
            teacher = api_models.Teacher.objects.get(id=teacher_id)
            courses = api_models.Course.objects.filter(teacher=teacher)
            students = api_models.EnrolledCourse.objects.filter(course__in=courses).values_list("user_id", flat=True).distinct()

            total_courses = courses.count()
            total_students = len(students)

            at_risk = api_models.DropoutPrediction.objects.filter(
                user_id__in=students,
                score__gt=0.7,
                predicted_at__gte=now() - timedelta(days=1)
            ).values("user_id").distinct().count()

            total_notes = api_models.Note.objects.filter(user_id__in=students).count()
            discussion_messages = api_models.Question_Answer_Message.objects.filter(user_id__in=students).count()

            daily_data = []
            for i in range(7):
                day = now() - timedelta(days=i)
                day_str = day.strftime("%Y-%m-%d")
                enrolls = api_models.EnrolledCourse.objects.filter(course__in=courses, date__date=day.date()).count()
                subs = api_models.AssignmentSubmission.objects.filter(student_id__in=students, submitted_at__date=day.date()).count()

                msgs = api_models.Question_Answer_Message.objects.filter(user_id__in=students, date__date=day.date()).count()


                daily_data.append({
                    "date": day_str,
                    "enrollments": enrolls,
                    "submissions": subs,
                    "messages": msgs,
                })

            top_students = []
            for uid in students[:10]:
                try:
                    user = User.objects.get(id=uid)
                    top_students.append({
                        "name": user.full_name or user.username,
                        "notes": api_models.Note.objects.filter(user=user).count(),
                        "assignments": api_models.AssignmentSubmission.objects.filter(student=user).count(),
                        "messages": api_models.Question_Answer_Message.objects.filter(user=user).count(),
                    })
                except Exception as e:
                    print(f"Error with user {uid}: {e}")

            return Response({
                "total_courses": total_courses,
                "total_students": total_students,
                "at_risk_students": at_risk,
                "total_notes": total_notes,
                "discussion_messages": discussion_messages,
                "daily_data": list(reversed(daily_data)),
                "top_students": sorted(top_students, key=lambda s: -(s["notes"] + s["assignments"] + s["messages"]))[:5]
            })

        except Exception as e:
            import traceback
            print("ERROR in TeacherAnalyticsAPIView:", e)
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)

class StudentActivityHistoryAPIView(APIView):
    def get(self, request, student_id):
        try:
            user = User.objects.get(id=student_id)
        except User.DoesNotExist:
            return Response({"error": "Student not found."}, status=404)

        today = now().date()
        results = []

        for i in range(6, -1, -1):  # past 7 days
            day = today - timedelta(days=i)
            note_count = api_models.Note.objects.filter(user=user, date__date=day).count()
            assignment_count = api_models.AssignmentSubmission.objects.filter(student=user, submitted_at__date=day).count()
            results.append({
                "date": day.strftime("%b %d"),
                "notes": note_count,
                "assignments": assignment_count,
            })

        return Response(results)
    
class AggregatedCourseContentAPIView(APIView):
    def get(self, request):
        notes = api_models.Note.objects.values_list("note", flat=True)
        course_descriptions = api_models.Course.objects.values_list("description", flat=True)
        material_titles = api_models.CourseMaterial.objects.values_list("title", flat=True)

        combined = "\n\n".join(list(course_descriptions) + list(notes) + list(material_titles))
        return Response({"content": combined})
    
class SharedResourceViewSet(viewsets.ModelViewSet):
    queryset = api_models.SharedResource.objects.all()
    serializer_class = api_serializer.SharedResourceSerializer
    parser_classes = (MultiPartParser, FormParser) 

    def get_queryset(self):
        group_id = self.request.query_params.get("group")
        return api_models.SharedResource.objects.filter(group_id=group_id)

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
