from django.contrib import admin
from api import models 

admin.site.register(models.Teacher)
admin.site.register(models.Category)
admin.site.register(models.Course)
admin.site.register(models.Question_Answer)
admin.site.register(models.Question_Answer_Message)

admin.site.register(models.EnrolledCourse)
admin.site.register(models.Note)
admin.site.register(models.Notification)
admin.site.register(models.CourseMaterial)

admin.site.register(models.StudyGroup)
admin.site.register(models.StudyGroupMember)
admin.site.register(models.GroupMessage)
admin.site.register(models.Assignment)
admin.site.register(models.AssignmentSubmission)
