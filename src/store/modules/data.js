import { defineStore } from 'pinia'

export const useDataStore = defineStore('data', {
  state: () => ({
    students: [
      {
        id: '2021001',
        name: '张三',
        gender: '男',
        department: '计算机学院',
        class: '计算机2101',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        status: 1
      }
    ],
    teachers: [
      {
        id: 'T2021001',
        name: '李老师',
        department: '计算机学院',
        title: '副教授',
        phone: '13800138002',
        email: 'lishi@example.com',
        status: 1
      }
    ],
    departments: [
      {
        id: 1,
        name: '计算机学院',
        leader: '张主任',
        phone: '13800138000',
        email: 'cs@example.com',
        status: 1
      }
    ],
    courses: [
      {
        id: 'CS001',
        name: '计算机导论',
        credit: 3,
        hours: 48,
        department: '计算机学院',
        teacher: '张老师',
        capacity: 60,
        selected: 45,
        semester: '2023-2024-1',
        status: 1
      }
    ],
    courseClasses: [
      {
        id: 'CSC001',
        courseId: 'CS001',
        className: '计算机导论(1班)',
        teacherId: 'T2021001',
        teacherName: '张老师',
        schedule: '周一 1-2节',
        location: 'A101',
        capacity: 30,
        selected: 28,
        status: 1
      }
    ],
    selections: [
      {
        id: 'SEL001',
        studentId: '2021001',
        studentName: '张三',
        courseId: 'CS001',
        courseName: '计算机导论',
        classId: 'CSC001',
        className: '计算机导论(1班)',
        teacherName: '张老师',
        semester: '2023-2024-1',
        score: null,
        status: 1 // 1: 已选课, 0: 已退课
      }
    ]
  }),

  actions: {
    // 学生相关操作
    addStudent(student) {
      this.students.push(student)
    },
    updateStudent(student) {
      const index = this.students.findIndex(item => item.id === student.id)
      if (index !== -1) {
        this.students[index] = student
      }
    },
    deleteStudent(id) {
      this.students = this.students.filter(item => item.id !== id)
    },

    // 教师相关操作
    addTeacher(teacher) {
      this.teachers.push(teacher)
    },
    updateTeacher(teacher) {
      const index = this.teachers.findIndex(item => item.id === teacher.id)
      if (index !== -1) {
        this.teachers[index] = teacher
      }
    },
    deleteTeacher(id) {
      this.teachers = this.teachers.filter(item => item.id !== id)
    },

    // 部门相关操作
    addDepartment(department) {
      this.departments.push(department)
    },
    updateDepartment(department) {
      const index = this.departments.findIndex(item => item.id === department.id)
      if (index !== -1) {
        this.departments[index] = department
      }
    },
    deleteDepartment(id) {
      this.departments = this.departments.filter(item => item.id !== id)
    },

    // 课程相关操作
    addCourse(course) {
      this.courses.push(course)
    },
    updateCourse(course) {
      const index = this.courses.findIndex(item => item.id === course.id)
      if (index !== -1) {
        this.courses[index] = course
      }
    },
    deleteCourse(id) {
      this.courses = this.courses.filter(item => item.id !== id)
    },

    // 课程班级相关操作
    addCourseClass(courseClass) {
      this.courseClasses.push(courseClass)
    },
    updateCourseClass(courseClass) {
      const index = this.courseClasses.findIndex(item => item.id === courseClass.id)
      if (index !== -1) {
        this.courseClasses[index] = courseClass
      }
    },
    deleteCourseClass(id) {
      this.courseClasses = this.courseClasses.filter(item => item.id !== id)
    },

    // 选课相关操作
    addSelection(selection) {
      // 检查是否已选过该课程
      const exists = this.selections.some(item => 
        item.studentId === selection.studentId && 
        item.courseId === selection.courseId &&
        item.status === 1
      )
      if (exists) {
        throw new Error('已选择该课程')
      }

      // 检查课程容量
      const courseClass = this.courseClasses.find(item => item.id === selection.classId)
      if (courseClass && courseClass.selected >= courseClass.capacity) {
        throw new Error('该班级已满')
      }

      // 更新选课数据
      this.selections.push(selection)

      // 更新课程和班级的已选人数
      const course = this.courses.find(item => item.id === selection.courseId)
      if (course) {
        course.selected++
      }
      if (courseClass) {
        courseClass.selected++
      }
    },

    // 退课
    cancelSelection(id) {
      const selection = this.selections.find(item => item.id === id)
      if (!selection) return

      selection.status = 0

      // 更新课程和班级的已选人数
      const course = this.courses.find(item => item.id === selection.courseId)
      if (course) {
        course.selected--
      }
      const courseClass = this.courseClasses.find(item => item.id === selection.classId)
      if (courseClass) {
        courseClass.selected--
      }
    },

    // 更新选课成绩
    updateSelectionScore(id, score) {
      const selection = this.selections.find(item => item.id === id)
      if (selection) {
        selection.score = score
      }
    }
  },

  persist: {
    key: 'system-data',
    storage: localStorage,
    paths: ['students', 'teachers', 'departments', 'courses', 'courseClasses', 'selections']
  }
}) 