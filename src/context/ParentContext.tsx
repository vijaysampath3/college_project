import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface LinkedStudent {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  schoolName: string;
  assignedTeacherName: string;
  teacherDepartment: string;
}

interface ParentContextType {
  selectedStudent: LinkedStudent | null;
  setSelectedStudent: (student: LinkedStudent | null) => void;
  linkedStudents: LinkedStudent[];
  setLinkedStudents: (students: LinkedStudent[]) => void;
  isLoadingStudents: boolean;
  setIsLoadingStudents: (loading: boolean) => void;
}

const ParentContext = createContext<ParentContextType | undefined>(undefined);

export const ParentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedStudent, setSelectedStudent] = useState<LinkedStudent | null>(null);
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  // Automatically select the first student if none is selected
  useEffect(() => {
    if (linkedStudents.length > 0 && !selectedStudent) {
      setSelectedStudent(linkedStudents[0]);
    }
  }, [linkedStudents, selectedStudent]);

  return (
    <ParentContext.Provider 
      value={{ 
        selectedStudent, 
        setSelectedStudent, 
        linkedStudents, 
        setLinkedStudents,
        isLoadingStudents,
        setIsLoadingStudents
      }}
    >
      {children}
    </ParentContext.Provider>
  );
};

export const useParentContext = () => {
  const context = useContext(ParentContext);
  if (context === undefined) {
    throw new Error('useParentContext must be used within a ParentProvider');
  }
  return context;
};
