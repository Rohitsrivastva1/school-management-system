import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Sample data arrays
const firstNames = [
  'Aarav', 'Aadhya', 'Arjun', 'Ananya', 'Aryan', 'Aisha', 'Aditya', 'Avni',
  'Rohan', 'Riya', 'Vikram', 'Priya', 'Suresh', 'Sunita', 'Rajesh', 'Kavita',
  'Manoj', 'Meera', 'Deepak', 'Sneha', 'Rahul', 'Pooja', 'Amit', 'Rekha',
  'Vijay', 'Sarita', 'Naveen', 'Shilpa', 'Ankit', 'Ritu', 'Sandeep', 'Geeta',
  'Pradeep', 'Neha', 'Vinod', 'Jyoti', 'Ravi', 'Sushma', 'Kumar', 'Manju',
  'Sunil', 'Lata', 'Gopal', 'Usha', 'Hari', 'Kamla', 'Bharat', 'Indira'
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Yadav', 'Patel', 'Jain',
  'Agarwal', 'Malhotra', 'Chopra', 'Reddy', 'Rao', 'Nair', 'Iyer', 'Pillai',
  'Mehta', 'Bhatt', 'Joshi', 'Pandey', 'Mishra', 'Tiwari', 'Dwivedi', 'Trivedi',
  'Saxena', 'Agarwal', 'Goyal', 'Bansal', 'Goel', 'Aggarwal', 'Khanna', 'Kapoor'
];

const subjects = [
  'Mathematics', 'English', 'Hindi', 'Science', 'Social Studies', 'Computer Science',
  'Physical Education', 'Art & Craft', 'Music', 'Environmental Studies'
];

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat'];

// Helper function to get random element from array
const getRandomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to generate random phone number
const generatePhoneNumber = () => {
  const prefixes = ['9876', '8765', '7654', '6543', '5432'];
  const prefix = getRandomElement(prefixes);
  const suffix = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return `+91${prefix}${suffix}`;
};

// Helper function to generate email
const generateEmail = (firstName: string, lastName: string, domain: string, suffix?: string) => {
  const baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
  const emailSuffix = suffix ? `.${suffix}` : '';
  return `${baseEmail}${emailSuffix}@${domain}`;
};

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Clearing existing data...');
    await prisma.grade.deleteMany();
    await prisma.homeworkSubmission.deleteMany();
    await prisma.homework.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.timetable.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.student.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.class.deleteMany();
    await prisma.user.deleteMany();
    await prisma.school.deleteMany();

    console.log('✅ Existing data cleared');

    // 1. Create School
    console.log('🏫 Creating school...');
    const school = await prisma.school.create({
      data: {
        name: 'Global Public School',
        email: 'info@globalpublicschool.edu',
        address: '123 Education Street, Knowledge City',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '+91-22-12345678',
        website: 'https://globalpublicschool.edu',
        domain: 'globalpublicschool.edu',
        academicYearStart: new Date('2024-04-01'),
        academicYearEnd: new Date('2025-03-31'),
        isActive: true
      }
    });
    console.log(`✅ School created: ${school.name}`);

    // 2. Create Admin User
    console.log('👨‍💼 Creating admin user...');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        schoolId: school.id,
        email: 'admin@globalpublicschool.edu',
        passwordHash: adminPasswordHash,
        role: 'admin',
        firstName: 'Rajesh',
        lastName: 'Kumar',
        phone: '+91-9876543210',
        isActive: true,
        emailVerified: true
      }
    });
    console.log(`✅ Admin created: ${admin.firstName} ${admin.lastName}`);

    // 3. Create Subjects
    console.log('📚 Creating subjects...');
    const subjectNames = ['Mathematics', 'English', 'Science', 'Social Studies', 'Hindi', 'Physical Education', 'Computer Science', 'Art'];
    const createdSubjects = [];
    for (const subjectName of subjectNames) {
      const subject = await prisma.subject.create({
        data: {
          schoolId: school.id,
          name: subjectName,
          code: subjectName.substring(0, 3).toUpperCase(),
          description: `${subjectName} curriculum`,
          isCore: true,
          isActive: true
        }
      });
      createdSubjects.push(subject);
    }
    console.log(`✅ ${createdSubjects.length} subjects created`);

    // 4. Create Classes and Class Teachers
    console.log('🏫 Creating classes and class teachers...');
    const classNames = ['1st', '2nd', '3rd', '4th', '5th'];
    const sections = ['A', 'B'];
    const createdClasses = [];
    const classTeachers = [];

    for (const className of classNames) {
      for (const section of sections) {
        // Create class teacher
        const teacherFirstName = getRandomElement(firstNames);
        const teacherLastName = getRandomElement(lastNames);
        const teacherEmail = generateEmail(teacherFirstName, teacherLastName, school.domain || 'globalpublicschool.edu', `teacher${Date.now()}`);
        const teacherPasswordHash = await bcrypt.hash('teacher123', 10);
        
        const classTeacher = await prisma.user.create({
          data: {
            schoolId: school.id,
            email: teacherEmail,
            passwordHash: teacherPasswordHash,
            role: 'class_teacher',
            firstName: teacherFirstName,
            lastName: teacherLastName,
            phone: generatePhoneNumber(),
            dateOfBirth: new Date(1985 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            gender: Math.random() > 0.5 ? 'male' : 'female',
            address: `${Math.floor(Math.random() * 100) + 1} Teacher Lane, ${getRandomElement(cities)}`,
            isActive: true,
            emailVerified: true
          }
        });

        // Create teacher record
        const teacher = await prisma.teacher.create({
          data: {
            userId: classTeacher.id,
            employeeId: `T${Date.now()}${Math.floor(Math.random() * 1000)}`,
            qualification: getRandomElement(['B.Ed', 'M.Ed', 'B.Sc', 'M.Sc', 'B.A', 'M.A']),
            subjects: [getRandomElement(createdSubjects).name, getRandomElement(createdSubjects).name],
            joiningDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1),
            department: getRandomElement(['Primary', 'Elementary', 'Mathematics', 'Science', 'Languages']),
            experienceYears: Math.floor(Math.random() * 15) + 1,
            isClassTeacher: true,
            isActive: true
          }
        });

        // Create class
        const classData = await prisma.class.create({
          data: {
            schoolId: school.id,
            name: className,
            section: section,
            academicYear: '2024-25',
            classTeacherId: classTeacher.id,
            maxStudents: 30,
            roomNumber: `${className}${section}`,
            isActive: true
          }
        });

        createdClasses.push(classData);
        classTeachers.push({ user: classTeacher, teacher });
        console.log(`✅ Class ${className}-${section} created with teacher ${teacherFirstName} ${teacherLastName}`);
      }
    }

    // 4b. Create Subject Teachers (non class-teachers)
    console.log('👩‍🏫 Creating subject teachers...');
    const subjectTeachers: { user: any; teacher: any }[] = [];
    for (let i = 0; i < 20; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const email = generateEmail(firstName, lastName, school.domain || 'globalpublicschool.edu', `subteacher${Date.now()}${i}`);
      const passwordHash = await bcrypt.hash('teacher123', 10);

      const user = await prisma.user.create({
        data: {
          schoolId: school.id,
          email,
          passwordHash,
          role: 'subject_teacher',
          firstName,
          lastName,
          phone: generatePhoneNumber(),
          dateOfBirth: new Date(1985 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          gender: Math.random() > 0.5 ? 'male' : 'female',
          address: `${Math.floor(Math.random() * 100) + 1} Teacher Colony, ${getRandomElement(cities)}`,
          isActive: true,
          emailVerified: true
        }
      });

      const teacher = await prisma.teacher.create({
        data: {
          userId: user.id,
          employeeId: `ST${Date.now()}${Math.floor(Math.random() * 1000)}`,
          qualification: getRandomElement(['B.Ed', 'M.Ed', 'B.Sc', 'M.Sc', 'B.A', 'M.A']),
          subjects: [getRandomElement(createdSubjects).name, getRandomElement(createdSubjects).name],
          joiningDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1),
          department: getRandomElement(['Mathematics', 'Science', 'Languages', 'Computer Science', 'Arts']),
          experienceYears: Math.floor(Math.random() * 15) + 1,
          isClassTeacher: false,
          isActive: true
        }
      });

      subjectTeachers.push({ user, teacher });
    }
    console.log(`✅ Subject Teachers created: ${subjectTeachers.length}`);

    // 5. Create Students and Parents
    console.log('👨‍🎓 Creating students and parents...');
    let studentCount = 0;
    let parentCount = 0;

    for (const classData of createdClasses) {
      console.log(`Creating students for ${classData.name}-${classData.section}...`);
      
      for (let i = 1; i <= 30; i++) {
        // Create parent (father)
        const fatherFirstName = getRandomElement(firstNames);
        const fatherLastName = getRandomElement(lastNames);
        const fatherEmail = generateEmail(fatherFirstName, fatherLastName, school.domain || 'globalpublicschool.edu', `parent${Date.now()}${i}`);
        const fatherPasswordHash = await bcrypt.hash('parent123', 10);
        
        const father = await prisma.user.create({
          data: {
            schoolId: school.id,
            email: fatherEmail,
            passwordHash: fatherPasswordHash,
            role: 'parent',
            firstName: fatherFirstName,
            lastName: fatherLastName,
            phone: generatePhoneNumber(),
            dateOfBirth: new Date(1975 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            gender: 'male',
            address: `${Math.floor(Math.random() * 100) + 1} Family Street, ${getRandomElement(cities)}`,
            isActive: true,
            emailVerified: true
          }
        });

        // Create student
        const studentFirstName = getRandomElement(firstNames);
        const studentLastName = fatherLastName; // Same as father's last name
        const studentEmail = generateEmail(studentFirstName, studentLastName, school.domain || 'globalpublicschool.edu', `student${Date.now()}${i}`);
        const studentPasswordHash = await bcrypt.hash('student123', 10);
        
        const studentUser = await prisma.user.create({
          data: {
            schoolId: school.id,
            email: studentEmail,
            passwordHash: studentPasswordHash,
            role: 'student',
            firstName: studentFirstName,
            lastName: studentLastName,
            phone: generatePhoneNumber(),
            dateOfBirth: new Date(2010 + parseInt(classData.name), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            gender: Math.random() > 0.5 ? 'male' : 'female',
            address: father.address,
            isActive: true,
            emailVerified: true
          }
        });

        // Create student record
        const student = await prisma.student.create({
          data: {
            userId: studentUser.id,
            classId: classData.id,
            rollNumber: `${classData.name}${classData.section}${i.toString().padStart(2, '0')}`,
            admissionNumber: `ADM${Date.now()}${studentCount + 1}`,
            admissionDate: new Date(2024, 3, 1), // April 1, 2024
            parentId: father.id,
            fatherName: `${fatherFirstName} ${fatherLastName}`,
            motherName: `${getRandomElement(firstNames)} ${fatherLastName}`,
            fatherPhone: father.phone,
            motherPhone: generatePhoneNumber(),
            fatherEmail: fatherEmail,
            motherEmail: generateEmail(getRandomElement(firstNames), fatherLastName, school.domain || 'globalpublicschool.edu', `mother${Date.now()}${i}`),
            emergencyContact: generatePhoneNumber(),
            bloodGroup: getRandomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
            transportMode: getRandomElement(['School Bus', 'Private Vehicle', 'Walking', 'Bicycle']),
            busRoute: Math.random() > 0.5 ? `Route ${Math.floor(Math.random() * 5) + 1}` : null,
            isActive: true
          }
        });

        studentCount++;
        parentCount++;
        
        if (studentCount % 10 === 0) {
          console.log(`✅ Created ${studentCount} students so far...`);
        }
      }
    }

    console.log(`✅ ${studentCount} students and ${parentCount} parents created`);

    // 6. Create some sample attendance records
    console.log('📊 Creating sample attendance records...');
    const students = await prisma.student.findMany({
      include: { user: true, class: true }
    });

    let attendanceCount = 0;
    const attendanceStatuses = ['present', 'absent', 'late'];
    
    // Create attendance for last 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      for (const student of students.slice(0, 50)) { // Sample 50 students
        const status = getRandomElement(attendanceStatuses);
        const marker = getRandomElement(classTeachers).user;
        
        await prisma.attendance.create({
          data: {
            studentId: student.id,
            classId: student.classId,
            date: date,
            status: status,
            markedBy: marker.id,
            remarks: status === 'absent' ? 'Absent without notice' : null
          }
        });
        
        attendanceCount++;
      }
    }

    console.log(`✅ ${attendanceCount} attendance records created`);

    // 7. Create some sample homework
    console.log('📝 Creating sample homework...');
    let homeworkCount = 0;
    
    for (const classData of createdClasses.slice(0, 3)) { // Create homework for first 3 classes
      const classTeacher = classTeachers.find(ct => ct.user.id === classData.classTeacherId);
      const subject = getRandomElement(createdSubjects);
      
      for (let i = 0; i < 3; i++) {
        const homework = await prisma.homework.create({
          data: {
            classId: classData.id,
            subjectId: subject.id,
            teacherId: classTeacher!.user.id,
            title: `${subject.name} Assignment ${i + 1}`,
            description: `Complete the exercises from chapter ${i + 1}. Submit by the due date.`,
            dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000), // Due in i+1 weeks
            isPublished: true
          }
        });
        
        homeworkCount++;
      }
    }

    console.log(`✅ ${homeworkCount} homework assignments created`);

    // 8. Create some sample grades
    console.log('📊 Creating sample grades...');
    let gradeCount = 0;
    
    for (const student of students.slice(0, 100)) { // Sample 100 students
      for (const subject of createdSubjects.slice(0, 5)) { // 5 subjects per student
        const marksObtained = Math.floor(Math.random() * 40) + 60; // 60-100 marks
        const totalMarks = 100;
        const percentage = (marksObtained / totalMarks) * 100;
        
        await prisma.grade.create({
          data: {
            studentId: student.id,
            subjectId: subject.id,
            examType: getRandomElement(['unit_test', 'mid_term', 'assignment']),
            examName: `${subject.name} Test`,
            marksObtained: marksObtained,
            totalMarks: totalMarks,
            percentage: percentage,
            grade: percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : 'C',
            examDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
            teacherId: getRandomElement(classTeachers).user.id,
            remarks: percentage >= 80 ? 'Excellent work!' : percentage >= 60 ? 'Good job' : 'Needs improvement',
            academicYear: '2024-25'
          }
        });
        
        gradeCount++;
      }
    }

    console.log(`✅ ${gradeCount} grade records created`);

    // Summary
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`🏫 School: ${school.name}`);
    console.log(`👨‍💼 Admin: ${admin.firstName} ${admin.lastName} (admin@globalpublicschool.edu / admin123)`);
    console.log(`📚 Subjects: ${createdSubjects.length}`);
    console.log(`🏫 Classes: ${createdClasses.length} (${classNames.length} grades × ${sections.length} sections)`);
    console.log(`👨‍🏫 Class Teachers: ${classTeachers.length}`);
    console.log(`👩‍🏫 Subject Teachers: ${subjectTeachers.length}`);
    console.log(`👨‍🎓 Students: ${studentCount}`);
    console.log(`👨‍👩‍👧‍👦 Parents: ${parentCount}`);
    console.log(`📊 Attendance Records: ${attendanceCount}`);
    console.log(`📝 Homework Assignments: ${homeworkCount}`);
    console.log(`📊 Grade Records: ${gradeCount}`);
    
    console.log('\n🔑 Demo Login Credentials:');
    console.log('Admin: admin@globalpublicschool.edu / admin123');
    console.log('Class Teacher: [teacher_email] / teacher123');
    console.log('Parent: [parent_email] / parent123');
    console.log('Student: [student_email] / student123');

    // Create sample timetable entries
    console.log('📅 Creating sample timetable entries...');
    
    const classes = await prisma.class.findMany({ where: { schoolId: school.id } });
    const subjects = await prisma.subject.findMany({ where: { schoolId: school.id } });
    const teachers = await prisma.user.findMany({ 
      where: { 
        schoolId: school.id, 
        role: { in: ['class_teacher', 'subject_teacher'] } 
      } 
    });

    if (classes.length > 0 && subjects.length > 0 && teachers.length > 0) {
      const timetableEntries = [];
      const days = [1, 2, 3, 4, 5]; // Monday to Friday
      const periods = [1, 2, 3, 4, 5, 6, 7, 8]; // 8 periods per day
      
      for (const classItem of classes.slice(0, 2)) { // Create timetable for first 2 classes
        // Find the class teacher for this class
        const classTeacher = await prisma.user.findFirst({
          where: {
            schoolId: school.id,
            role: 'class_teacher',
            teacher: {
              isClassTeacher: true
            }
          },
          include: {
            teacher: true
          }
        });
        
        for (const day of days) {
          for (const period of periods) {
            // Always assign first period to class teacher with a core subject
            if (period === 1 && classTeacher) {
              const coreSubject = subjects.find(s => s.isCore) || subjects[0];
              const startHour = 8 + (period - 1);
              const startTime = `${startHour.toString().padStart(2, '0')}:00`;
              const endTime = `${(startHour + 1).toString().padStart(2, '0')}:00`;
              
              timetableEntries.push({
                schoolId: school.id,
                classId: classItem.id,
                subjectId: coreSubject.id,
                teacherId: classTeacher.id,
                dayOfWeek: day,
                periodNumber: period,
                startTime,
                endTime,
                roomNumber: `Room ${100 + Math.floor(Math.random() * 20)}`,
                academicYear: '2024-25',
                isActive: true,
              });
            } else {
              // Skip some periods to make it realistic, but ensure we have some content
              if (Math.random() > 0.6) continue;
              
              const subject = subjects[Math.floor(Math.random() * subjects.length)];
              const teacher = teachers[Math.floor(Math.random() * teachers.length)];
              
              const startHour = 8 + (period - 1);
              const startTime = `${startHour.toString().padStart(2, '0')}:00`;
              const endTime = `${(startHour + 1).toString().padStart(2, '0')}:00`;
              
              timetableEntries.push({
                schoolId: school.id,
                classId: classItem.id,
                subjectId: subject.id,
                teacherId: teacher.id,
                dayOfWeek: day,
                periodNumber: period,
                startTime,
                endTime,
                roomNumber: `Room ${100 + Math.floor(Math.random() * 20)}`,
                academicYear: '2024-25',
                isActive: true,
              });
            }
          }
        }
      }
      
      await prisma.timetable.createMany({
        data: timetableEntries,
        skipDuplicates: true,
      });
      
      console.log(`✅ Created ${timetableEntries.length} timetable entries`);
    }

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedDatabase()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
