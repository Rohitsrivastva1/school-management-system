const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyData() {
  try {
    console.log('🔍 Verifying seeded data...\n');

    // Check school
    const school = await prisma.school.findFirst();
    console.log('🏫 School:', school ? school.name : 'Not found');

    // Check admin
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' },
      include: { school: true }
    });
    console.log('👨‍💼 Admin:', admin ? `${admin.firstName} ${admin.lastName} (${admin.email})` : 'Not found');

    // Check classes
    const classes = await prisma.class.findMany({
      include: { 
        classTeacher: true,
        _count: { select: { students: true } }
      }
    });
    console.log(`🏫 Classes: ${classes.length}`);
    classes.forEach(cls => {
      console.log(`  - ${cls.name} ${cls.section}: ${cls._count.students} students, Teacher: ${cls.classTeacher?.firstName} ${cls.classTeacher?.lastName}`);
    });

    // Check teachers
    const teachers = await prisma.teacher.findMany({
      include: { user: true }
    });
    console.log(`👨‍🏫 Teachers: ${teachers.length}`);
    teachers.forEach(teacher => {
      console.log(`  - ${teacher.user.firstName} ${teacher.user.lastName} (${teacher.employeeId})`);
    });

    // Check students
    const students = await prisma.student.findMany({
      include: { 
        user: true,
        class: true
      }
    });
    console.log(`👨‍🎓 Students: ${students.length}`);

    // Check parents
    const parents = await prisma.user.findMany({
      where: { role: 'parent' }
    });
    console.log(`👨‍👩‍👧‍👦 Parents: ${parents.length}`);

    // Check subjects
    const subjects = await prisma.subject.findMany();
    console.log(`📚 Subjects: ${subjects.length}`);
    subjects.forEach(subject => {
      console.log(`  - ${subject.name}`);
    });

    console.log('\n✅ Data verification completed!');

  } catch (error) {
    console.error('❌ Error verifying data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();
