from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import Invite

User = get_user_model()

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "first_name", "last_name", "role", "department", "is_active")
    search_fields = ("email", "first_name", "last_name")
    list_filter = ("role", "department", "is_active", "is_staff")

@admin.register(Invite)
class InviteAdmin(admin.ModelAdmin):
    list_display = ("email", "department", "created_by", "is_accepted", "created_at")
    search_fields = ("email",)
    list_filter = ("is_accepted", "department")
