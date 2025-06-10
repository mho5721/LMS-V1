from api import views as api_views
from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'study-groups', api_views.StudyGroupViewSet)
router.register(r'study-group-members', api_views.StudyGroupMemberViewSet)
router.register(r'study-group-messages', api_views.GroupMessageViewSet)

urlpatterns = [
    # Authentication Endpoints

    path("user/token/", api_views.MyTokenObtainPairView.as_view()),
    path("user/token/refresh/", TokenRefreshView.as_view()),
    path("user/register/", api_views.RegisterView.as_view()),
    path("user/password-reset/<email>/", api_views.PasswordResetEmailVerifyAPIView.as_view()),
    path("user/password-change/", api_views.PasswordChangeAPIView.as_view()),
    path("user/profile/<user_id>/", api_views.ProfileAPIView.as_view()),
    path("user/change-password/", api_views.ChangePasswordAPIView.as_view()),

    # Core Endpoints
    path("course/category/", api_views.CategoryListAPIView.as_view()),
    path("course/course-list/", api_views.CourseListAPIView.as_view()),
    path("course/search/", api_views.SearchCourseAPIView.as_view()),
    path("course/course-detail/<slug>/", api_views.CourseDetailAPIView.as_view()),


    # Course Material Routes
    path("course/<course_id>/materials/", api_views.CourseMaterialListView.as_view(), name="course-material-list"),
    path("course/materials/upload/", api_views.CourseMaterialCreateView.as_view(), name="course-material-upload"),
    path("course/materials/<int:pk>/delete/", api_views.CourseMaterialDeleteView.as_view(), name="course-material-delete"),


    # Student API Endpoints
    path("student/summary/<user_id>/", api_views.StudentSummaryAPIView.as_view()),
    path("student/course-list/<user_id>/", api_views.StudentCourseListAPIView.as_view()),
    path("student/course-detail/<user_id>/<enrollment_id>/", api_views.StudentCourseDetailAPIView.as_view()),
    path("student/course-completed/", api_views.StudentCourseCompletedCreateAPIView.as_view()),
    path("student/course-note/<user_id>/<enrollment_id>/", api_views.StudentNoteCreateAPIView.as_view()),
    path("student/course-note-detail/<user_id>/<enrollment_id>/<note_id>/", api_views.StudentNoteDetailAPIView.as_view()),
    path("student/review-detail/<user_id>/<review_id>/", api_views.StudentRateCourseUpdateAPIView.as_view()),
    path("student/wishlist/<user_id>/", api_views.StudentWishListListCreateAPIView.as_view()),
    path("student/question-answer-list-create/<course_id>/", api_views.QuestionAnswerListCreateAPIView.as_view()),
    path("student/question-answer-message-create/", api_views.QuestionAnswerMessageSendAPIView.as_view()),
    
    path("study-groups/available/<int:user_id>/", api_views.available_study_groups),
    path("study-groups/join/", api_views.join_study_group),
    path("study-groups/leave/", api_views.leave_study_group),
    path("study-groups/remove-member/", api_views.remove_member),
    path("study-groups/delete/<int:group_id>/", api_views.delete_study_group),
    
    path("student/course-assignments/<int:course_id>/", api_views.StudentCourseAssignmentAPIView.as_view()),
    path("student/submit-assignment/", api_views.AssignmentSubmissionCreateAPIView.as_view()),
    path("student/assignment-submissions/<int:user_id>/", api_views.StudentAssignmentSubmissionsAPIView.as_view()),
    
    path("student/dropout-risk/", api_views.DropoutRiskAPIView.as_view()),
    path("student/activity-history/<int:student_id>/", api_views.StudentActivityHistoryAPIView.as_view()),
    path("student/aggregated-course-content/", api_views.AggregatedCourseContentAPIView.as_view()),




    # Teacher Routes
    path("teacher/summary/<teacher_id>/", api_views.TeacherSummaryAPIView.as_view()),
    path("teacher/course-lists/<teacher_id>/", api_views.TeacherCourseListAPIView.as_view()),
    path("teacher/review-lists/<teacher_id>/", api_views.TeacherReviewListAPIView.as_view()),
    path("teacher/review-detail/<teacher_id>/<review_id>/", api_views.TeacherReviewDetailAPIView.as_view()),
    path("teacher/student-lists/<teacher_id>/", api_views.TeacherStudentsListAPIVIew.as_view({'get': 'list'})),
    path("teacher/question-answer-list/<teacher_id>/", api_views.TeacherQuestionAnswerListAPIView.as_view()),
    path("teacher/noti-list/<teacher_id>/", api_views.TeacherNotificationListAPIView.as_view()),
    path("teacher/noti-detail/<teacher_id>/<noti_id>", api_views.TeacherNotificationDetailAPIView.as_view()),
    path("teacher/course-create/", api_views.CourseCreateAPIView.as_view()),
    path("teacher/course-update/<teacher_id>/<course_id>/", api_views.CourseUpdateAPIView.as_view()),
    path("teacher/course-detail/<course_id>/", api_views.TeacherCourseDetailAPIView.as_view()),
    path("teacher/course/variant-delete/<variant_id>/<teacher_id>/<course_id>/", api_views.CourseVariantDeleteAPIView.as_view()),
    path("teacher/course/variant-item-delete/<variant_id>/<variant_item_id>/<teacher_id>/<course_id>/", api_views.CourseVariantItemDeleteAPIVIew.as_view()),
    path("teacher/course-full-detail/<user_id>/<course_id>/", api_views.InstructorCourseFullDetailAPIView.as_view()),
    path("teacher/course-note/", api_views.InstructorNoteCreateAPIView.as_view()),
    path("teacher/course-note-detail/<user_id>/<course_id>/<note_id>/", api_views.InstructorNoteDetailAPIView.as_view()),
    path("teacher/assignments/<course_id>/", api_views.InstructorAssignmentListCreateAPIView.as_view()),
    path("teacher/assignment-submissions/<assignment_id>/", api_views.InstructorAssignmentSubmissionsAPIView.as_view()),
    path("teacher/grade-submission/<int:id>/", api_views.GradeAssignmentAPIView.as_view()),
    path("teacher/analytics/<teacher_id>/", api_views.TeacherAnalyticsAPIView.as_view()),



    path("file-upload/", api_views.FileUploadAPIView.as_view())

]

urlpatterns += router.urls



