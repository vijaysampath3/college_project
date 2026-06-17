import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardContent, Badge } from '../../components/ui';
import { Search, ChevronRight, UserPlus, Users, Check } from 'lucide-react';
import { schoolService, School } from '../../services/school.service';
import { teacherService, Teacher } from '../../services/teacher.service';
import { studentService, Student } from '../../services/student.service';
import { assignmentService, TeacherStudentAssignment } from '../../services/assignment.service';

export const AssignmentCenter: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setIsLoading(true);
      const data = await schoolService.getSchools();
      setSchools(data);
    } catch (error) {
      console.error("Failed to load schools", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchoolSelect = async (school: School) => {
    setSelectedSchool(school);
    setSelectedTeacher(null);
    setTeachers([]);
    setStudents([]);
    setSelectedStudents(new Set());
    setSearchTerm('');
    
    try {
      setIsLoading(true);
      const [teachersData, studentsData] = await Promise.all([
        teacherService.getTeachersBySchool(school.id),
        studentService.getStudentsBySchool(school.id)
      ]);
      setTeachers(teachersData);
      setStudents(studentsData);
    } catch (error) {
      console.error("Failed to load school data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherSelect = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setSelectedStudents(new Set());
    
    try {
      setIsLoading(true);
      const assignments = await assignmentService.getStudentsForTeacher(teacher.id);
      const assignedIds = assignments.map(a => a.student_id);
      setAssignedStudents(assignedIds);
      
      // Pre-select already assigned students
      setSelectedStudents(new Set(assignedIds));
    } catch (error) {
      console.error("Failed to load assignments", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  const handleAssign = async () => {
    if (!selectedTeacher) return;
    
    try {
      setIsAssigning(true);
      // We send all selected students. The backend will deactivate old ones if any and create new ones.
      // Wait, the backend assign_students function currently deactivates previous assignments for these specific students,
      // and creates new ones for the selected teacher. It does NOT remove assignments for students who were un-selected.
      // If the admin unchecks a student, we should remove the assignment.
      
      // Let's get the current assigned students
      const currentAssigned = new Set(assignedStudents);
      const newSelected = selectedStudents;
      
      const toAssign = Array.from(newSelected).filter(id => !currentAssigned.has(id));
      const toRemove = Array.from(currentAssigned).filter(id => !newSelected.has(id));
      
      if (toAssign.length > 0) {
        await assignmentService.assignStudents(selectedTeacher.id, toAssign);
      }
      
      if (toRemove.length > 0) {
        // Find assignment IDs to remove
        const assignments = await assignmentService.getStudentsForTeacher(selectedTeacher.id);
        const removePromises = toRemove.map(studentId => {
          const assignment = assignments.find(a => a.student_id === studentId);
          if (assignment) {
            return assignmentService.removeAssignment(assignment.id);
          }
          return Promise.resolve();
        });
        await Promise.all(removePromises);
      }
      
      alert('Assignments updated successfully!');
      
      // Reload assignments
      const updatedAssignments = await assignmentService.getStudentsForTeacher(selectedTeacher.id);
      setAssignedStudents(updatedAssignments.map(a => a.student_id));
      
    } catch (error) {
      console.error("Failed to update assignments", error);
      alert('Failed to update assignments.');
    } finally {
      setIsAssigning(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="admin" title="Assignment Center">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Assignment Center</h1>
        <p className="text-gray-600">Assign students to teachers within their school</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Step 1 & 2: School and Teacher Selection */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Step 1: Select School</h2>
              <div className="space-y-2">
                {isLoading && !selectedSchool ? (
                  <p className="text-gray-500 text-sm">Loading schools...</p>
                ) : schools.map(school => (
                  <button
                    key={school.id}
                    onClick={() => handleSchoolSelect(school)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      selectedSchool?.id === school.id 
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20' 
                        : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium text-gray-900">{school.school_name}</span>
                    <ChevronRight className={`w-4 h-4 ${selectedSchool?.id === school.id ? 'text-primary-500' : 'text-gray-400'}`} />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedSchool && (
            <Card className="animate-in fade-in slide-in-from-top-4 duration-300">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Step 2: Select Teacher</h2>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {teachers.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No teachers in this school.</p>
                  ) : teachers.map(teacher => (
                    <button
                      key={teacher.id}
                      onClick={() => handleTeacherSelect(teacher)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                        selectedTeacher?.id === teacher.id 
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20' 
                          : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        selectedTeacher?.id === teacher.id ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {teacher.teacher_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{teacher.teacher_name}</p>
                        <p className="text-xs text-gray-500 truncate">{teacher.department || 'Teacher'}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${selectedTeacher?.id === teacher.id ? 'text-primary-500' : 'text-gray-400'}`} />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Step 3: Student Selection & Assignment */}
        <div className="lg:col-span-2">
          {selectedTeacher ? (
            <Card className="h-full animate-in fade-in slide-in-from-right-4 duration-300">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Step 3: Assign Students</h2>
                    <p className="text-gray-600">
                      Select students to assign to <span className="font-semibold">{selectedTeacher.teacher_name}</span>
                    </p>
                  </div>
                  <Badge variant="primary">
                    {selectedStudents.size} Selected
                  </Badge>
                </div>

                <div className="relative mb-6">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none transition-colors"
                  />
                </div>

                <div className="flex-1 min-h-[300px] max-h-[500px] overflow-y-auto pr-2 space-y-2 mb-6">
                  {students.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <Users className="w-12 h-12 mb-3 text-gray-300" />
                      <p>No students found in this school.</p>
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No students match your search.</p>
                  ) : (
                    filteredStudents.map(student => {
                      const isSelected = selectedStudents.has(student.id);
                      return (
                        <div
                          key={student.id}
                          onClick={() => toggleStudentSelection(student.id)}
                          className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border mr-4 flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-primary-500 border-primary-500' : 'border-gray-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center text-white font-semibold mr-4">
                            {student.student_name.charAt(0)}
                          </div>
                          
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{student.student_name}</p>
                            <p className="text-sm text-gray-500 font-mono">{student.student_id}</p>
                          </div>
                          
                          <div className="text-right">
                            {student.grade && <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Grade {student.grade}</span>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={handleAssign}
                    disabled={isAssigning}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50"
                  >
                    {isAssigning ? 'Saving...' : 'Save Assignments'}
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full border-dashed border-2 bg-gray-50/50">
              <CardContent className="h-full flex flex-col items-center justify-center text-gray-400 p-12 text-center">
                <UserPlus className="w-16 h-16 mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-500 mb-2">Assign Students</h3>
                <p className="max-w-xs">
                  Select a school and a teacher from the list to start assigning students.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
