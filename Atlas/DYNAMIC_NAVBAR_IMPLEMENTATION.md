# Dynamic Navbar Implementation

## Overview
Successfully transformed the hardcoded navbar into a dynamic system that fetches all data from APIs. The navigation now displays real user information, school details, and role-based menu items instead of static hardcoded values.

## 🔧 **API Integration**

### **New API Endpoints Added**

#### **User Details API**
```kotlin
@GET("auth/user-details")
suspend fun getUserDetails(): ApiResponse<UserDetailsDto>
```

#### **School Information API**
```kotlin
@GET("school/info")
suspend fun getSchoolInfo(): ApiResponse<SchoolInfoDto>
```

### **New Data Transfer Objects**

#### **UserDetailsDto**
```kotlin
data class UserDetailsDto(
    val id: String,
    val email: String,
    val role: String,
    val firstName: String?,
    val lastName: String?,
    val displayName: String?,
    val profileImage: String?,
    val schoolId: String?,
    val department: String?,
    val position: String?
)
```

#### **SchoolInfoDto**
```kotlin
data class SchoolInfoDto(
    val id: String,
    val name: String,
    val shortName: String?,
    val description: String?,
    val address: String?,
    val phone: String?,
    val email: String?,
    val website: String?,
    val logo: String?,
    val establishedYear: Int?
)
```

## 🏗️ **Architecture Implementation**

### **NavigationViewModel**
- **Purpose**: Manages navigation data state and API calls
- **Features**:
  - Loads user details and school information
  - Provides formatted display names and roles
  - Handles loading states and errors
  - Reactive UI updates

```kotlin
class NavigationViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = DashboardRepository(application)
    private val _uiState = MutableStateFlow(NavigationUiState())
    val uiState: StateFlow<NavigationUiState> = _uiState

    fun loadNavigationData() {
        // Loads user details and school info in parallel
    }
    
    fun getUserDisplayName(): String {
        // Returns formatted user display name
    }
    
    fun getUserRole(): String {
        // Returns formatted user role
    }
    
    fun getSchoolName(): String {
        // Returns school name
    }
}
```

### **MenuManager**
- **Purpose**: Dynamically creates menu items based on user role
- **Features**:
  - Role-based menu generation
  - Different menus for Admin, Teacher, Parent
  - Dynamic icon and text assignment
  - Proper menu structure

```kotlin
object MenuManager {
    fun setupMenuForRole(menu: Menu, userDetails: UserDetailsDto?) {
        val role = userDetails?.role?.lowercase() ?: "teacher"
        
        when (role) {
            "admin" -> setupAdminMenu(menu)
            "class_teacher", "subject_teacher", "teacher" -> setupTeacherMenu(menu)
            "parent" -> setupParentMenu(menu)
            else -> setupDefaultMenu(menu)
        }
    }
}
```

## 📱 **UI Updates**

### **Navigation Header (nav_header.xml)**
- **Dynamic User Information**:
  - `user_name`: Displays real user name from API
  - `user_role`: Shows formatted role (e.g., "Subject Teacher", "Administrator")
  - `school_name`: Displays actual school name
  - `school_description`: Shows school description

### **Loading States**
- **Initial State**: Shows "Loading..." for all fields
- **Error State**: Shows "Error" with fallback messages
- **Success State**: Displays real data from APIs

### **Real-time Updates**
- **Reactive UI**: Updates automatically when data loads
- **Error Handling**: Graceful fallbacks for failed API calls
- **Loading Indicators**: Visual feedback during data loading

## 🎯 **Role-Based Menu System**

### **Admin Menu**
- Dashboard
- Classes
- Students
- Attendance
- Homework
- Timetable
- Reports
- Settings
- Logout

### **Teacher Menu**
- Dashboard
- Classes
- Students
- Attendance
- Homework
- Timetable
- Reports
- Settings
- Logout

### **Parent Menu**
- Dashboard
- Attendance
- Homework
- Timetable
- Reports
- Settings
- Logout

## 🔄 **Data Flow**

### **1. Initialization**
```
MainActivity.onCreate() → NavigationViewModel.loadNavigationData()
```

### **2. API Calls**
```
NavigationViewModel → DashboardRepository → ApiService → Backend APIs
```

### **3. UI Updates**
```
API Response → NavigationViewModel → MainActivity → NavigationView
```

### **4. Menu Generation**
```
User Role → MenuManager → Dynamic Menu Creation
```

## 📊 **Key Features Implemented**

### **Dynamic User Information**
- **Real Name**: Fetched from user profile API
- **Role Display**: Formatted role names (e.g., "Subject Teacher" instead of "subject_teacher")
- **Fallback Logic**: Uses displayName, firstName+lastName, or firstName as fallback

### **Dynamic School Information**
- **School Name**: Real school name from API
- **School Description**: Actual school description
- **Fallback Values**: Default values if API fails

### **Role-Based Navigation**
- **Dynamic Menus**: Different menu items based on user role
- **Proper Icons**: Appropriate icons for each menu item
- **Logical Grouping**: Settings and logout separated by divider

### **Error Handling**
- **Network Errors**: Graceful handling of API failures
- **Loading States**: Visual feedback during data loading
- **Fallback Values**: Default values when data unavailable

## 🚀 **Benefits Achieved**

1. **Real Data**: All navbar information now comes from APIs
2. **Role-Based UI**: Different menus for different user types
3. **Dynamic Updates**: UI updates automatically when data changes
4. **Error Resilience**: Graceful handling of API failures
5. **Maintainable Code**: Centralized navigation logic
6. **Scalable Design**: Easy to add new roles or menu items
7. **Better UX**: Loading states and error feedback

## 🔧 **Technical Implementation**

### **Repository Pattern**
- Extended `DashboardRepository` with new API methods
- Consistent error handling across all API calls
- Proper response processing and data mapping

### **ViewModel Pattern**
- `NavigationViewModel` manages navigation state
- Reactive UI updates with StateFlow
- Proper lifecycle management

### **Menu Management**
- `MenuManager` handles dynamic menu creation
- Role-based menu generation
- Centralized menu logic

### **MainActivity Integration**
- Observes navigation data changes
- Updates UI reactively
- Handles menu generation

## 📱 **Screen Updates**

### **Navigation Header**
- ✅ **User Name**: Dynamic from API
- ✅ **User Role**: Formatted role display
- ✅ **School Name**: Real school name
- ✅ **School Description**: Actual description

### **Navigation Menu**
- ✅ **Role-Based**: Different menus per user type
- ✅ **Dynamic Icons**: Appropriate icons for each item
- ✅ **Proper Structure**: Logical grouping and organization

### **Loading States**
- ✅ **Initial Loading**: "Loading..." indicators
- ✅ **Error States**: Graceful error handling
- ✅ **Success States**: Real data display

## 🔮 **Future Enhancements**

- **Profile Images**: Load and display user profile pictures
- **School Logo**: Display school logo in header
- **Real-time Updates**: WebSocket integration for live updates
- **Menu Customization**: User-customizable menu items
- **Notifications**: Badge counts on menu items
- **Offline Support**: Cache navigation data locally

The navbar is now completely dynamic and fetches all data from APIs, providing a personalized and role-appropriate navigation experience for each user!
