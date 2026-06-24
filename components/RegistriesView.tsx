import React, { useState, useEffect } from 'react';
import { Doctor, Patient, Laboratory, DentalWorkOrder, ScanResult } from '../types';
import { Language } from '../translations';
import { Plus, User, Building, Briefcase, Trash2, Edit2, CheckCircle2, Shield, Download, FileSpreadsheet, Server, Calendar, Clock, Database, ChevronRight, FileCode } from 'lucide-react';

interface RegistriesViewProps {
  lang: Language;
  onNavigateToScanner: () => void;
}

const regTranslations = {
  en: {
    title: "Clinical ERP & Database",
    subtitle: "Manage clinicians, patient profiles, dental laboratories, and unified CAD/CAM milling work orders",
    tabs: {
      doctors: "Doctors & Clinicians",
      patients: "Patient Catalog",
      labs: "Dental Laboratories",
      jobs: "Milling Work Orders"
    },
    actions: {
      addNew: "Register New",
      edit: "Edit",
      delete: "Delete",
      save: "Save Record",
      cancel: "Cancel",
      exportDb: "Export Supabase SQL",
      active: "Active",
      status: "Status"
    },
    doctorFields: {
      name: "Clinician Full Name",
      license: "Dental License Number",
      specialty: "Clinical Specialty",
      email: "E-mail Address",
      phone: "Mobile / Phone No.",
      clinic: "Primary Clinic Workspace",
      placeholderName: "Dr. Jonathan Crane",
      placeholderSpecialty: "Prosthodontist / Orthodontist"
    },
    patientFields: {
      name: "Patient Full Name",
      clinicalId: "Clinical History ID",
      birthDate: "Date of Birth",
      gender: "Gender",
      notes: "Relevant Medical Anamnesis",
      placeholderName: "Sarah Connor"
    },
    labFields: {
      name: "Laboratory Name",
      director: "Lead Technician / Director",
      address: "Mailing Address / Delivery Hub",
      exocad: "Exocad / 3Shape Certified"
    },
    jobFields: {
      doctor: "Responsible Doctor",
      patient: "Assigned Patient",
      lab: "Target Laboratory",
      treatment: "Treatment/Restoration Type",
      status: "Production Stage",
      delivery: "Target Delivery Date",
      notes: "Technical Prescriptions",
      cost: "Milling Cost (USD)",
      treatments: {
        crown: "Single Anatomical Crown",
        bridge: "Fixed Multi-unit Bridge",
        onlay: "Inlay/Onlay/Overlay",
        implant: "Implant-supported Prosthesis",
        orthodontics: "Clear Aligner Thermoforming",
        other: "Custom Dental Appliance"
      },
      states: {
        pending: "Order Pending",
        in_design: "CAD Designing (Exocad)",
        milling: "3D Printing/Milling CAM",
        completed: "Sintered & Sanitized",
        canceled: "Clinical Canceled"
      }
    }
  },
  es: {
    title: "ERP Clínico y Base de Datos",
    subtitle: "Gestione doctores, expedientes de pacientes, laboratorios asociados y órdenes de trabajo CAD/CAM",
    tabs: {
      doctors: "Médicos y Dentistas",
      patients: "Catálogo de Pacientes",
      labs: "Laboratorios Dentales",
      jobs: "Órdenes de Trabajo"
    },
    actions: {
      addNew: "Nuevo Registro",
      edit: "Editar",
      delete: "Eliminar",
      save: "Guardar Registro",
      cancel: "Cancelar",
      exportDb: "Esquema Supabase SQL",
      active: "Activo",
      status: "Estado"
    },
    doctorFields: {
      name: "Nombre Completo del Médico",
      license: "Cédula Profesional",
      specialty: "Especialidad Clínica",
      email: "Correo Electrónico",
      phone: "Teléfono Móvil",
      clinic: "Clínica Principal",
      placeholderName: "Dr. Jonathan Crane",
      placeholderSpecialty: "Rehabilitador Oral / Ortodoncista"
    },
    patientFields: {
      name: "Nombre de Paciente",
      clinicalId: "ID de Expediente Clínico",
      birthDate: "Fecha de Nacimiento",
      gender: "Género",
      notes: "Anamnesis o Notas Clínicas",
      placeholderName: "Sarah Connor"
    },
    labFields: {
      name: "Nombre del Laboratorio",
      director: "Director / Técnico Responsable",
      address: "Dirección de Despacho",
      exocad: "Certificación Exocad / 3Shape"
    },
    jobFields: {
      doctor: "Médico Firmante",
      patient: "Paciente Designado",
      lab: "Laboratorio Destino",
      treatment: "Tratamiento o Restauración",
      status: "Estado de Producción",
      delivery: "Fecha de Entrega Compromiso",
      notes: "Instrucciones Técnicas",
      cost: "Costo de Maquila ($)",
      treatments: {
        crown: "Corona Anatómica Individual",
        bridge: "Puente Fijo Plurirradicular",
        onlay: "Inlay / Onlay / Overlay",
        implant: "Prótesis sobre Implante",
        orthodontics: "Termoformado de Alineador",
        other: "Otro Aparato Personalizado"
      },
      states: {
        pending: "Pendiente de Envío",
        in_design: "Diseño CAD (Exocad)",
        milling: "Fresado/Impresión CAM",
        completed: "Sinterizado y Terminado",
        canceled: "Cancelado"
      }
    }
  },
  pt: {
    title: "ERP Clínico & Base de Dados",
    subtitle: "Gerencie dentistas, prontuários de pacientes, laboratórios e ordens de fresagem CAD/CAM",
    tabs: {
      doctors: "Médicos & Dentistas",
      patients: "Catálogo de Pacientes",
      labs: "Laboratórios Protéticos",
      jobs: "Ordens de Serviço"
    },
    actions: {
      addNew: "Novo Registro",
      edit: "Editar",
      delete: "Excluir",
      save: "Salvar Registro",
      cancel: "Cancelar",
      exportDb: "Esquema Supabase SQL",
      active: "Ativo",
      status: "Status"
    },
    doctorFields: {
      name: "Nome Completo do Dentista",
      license: "Registro CRO / Licença",
      specialty: "Especialidade",
      email: "E-mail de Contato",
      phone: "Telefone Celular",
      clinic: "Consultório Principal",
      placeholderName: "Dr. Jonathan Crane",
      placeholderSpecialty: "Protesista / Implantodontista"
    },
    patientFields: {
      name: "Nome do Paciente",
      clinicalId: "Número do Prontuário",
      birthDate: "Data de Nascimento",
      gender: "Gênero",
      notes: "Anamnese Médica",
      placeholderName: "Sarah Connor"
    },
    labFields: {
      name: "Nome do Laboratório",
      director: "Responsável Técnico",
      address: "Endereço de Entrega",
      exocad: "Certificado Exocad / 3Shape"
    },
    jobFields: {
      doctor: "Dentista Solicitante",
      patient: "Paciente",
      lab: "Laboratório Selecionado",
      treatment: "Tipo de Reabilitação",
      status: "Fase de Produção",
      delivery: "Previsão de Entrega",
      notes: "Indicação Técnica",
      cost: "Custo Maquete ($)",
      treatments: {
        crown: "Coroa Anatômica Unitária",
        bridge: "Ponte Fixa Provisória",
        onlay: "Inlay / Onlay / Overlay",
        implant: "Prótese sobre Implante",
        orthodontics: "Alinhadores Estéticos",
        other: "Outro Dispositivo"
      },
      states: {
        pending: "Aguardando Envio",
        in_design: "Desenho CAD (Exocad)",
        milling: "Fresagem/Impressão CAM",
        completed: "Finalizado & Esterilizado",
        canceled: "Cancelado"
      }
    }
  }
};

export const RegistriesView: React.FC<RegistriesViewProps> = ({ lang, onNavigateToScanner }) => {
  const [activeTab, setActiveTab] = useState<'doctors' | 'patients' | 'labs' | 'jobs'>('doctors');
  const t = regTranslations[lang] || regTranslations.en;

  // State Lists
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [jobs, setJobs] = useState<DentalWorkOrder[]>([]);
  const [availableScans, setAvailableScans] = useState<ScanResult[]>([]);

  // Form states and toggles
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Doctor Form Fields
  const [docName, setDocName] = useState('');
  const [docLicense, setDocLicense] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docPhone, setDocPhone] = useState('');
  const [docClinic, setDocClinic] = useState('');

  // Patient Form Fields
  const [patName, setPatName] = useState('');
  const [patClinicalId, setPatClinicalId] = useState('');
  const [patBirthDate, setPatBirthDate] = useState('');
  const [patGender, setPatGender] = useState<'M' | 'F' | 'O'>('M');
  const [patNotes, setPatNotes] = useState('');

  // Lab Form Fields
  const [labName, setLabName] = useState('');
  const [labDirector, setLabDirector] = useState('');
  const [labAddress, setLabAddress] = useState('');
  const [labEmail, setLabEmail] = useState('');
  const [labPhone, setLabPhone] = useState('');
  const [labExocad, setLabExocad] = useState(true);

  // Job Form Fields
  const [jobDocId, setJobDocId] = useState('');
  const [jobPatId, setJobPatId] = useState('');
  const [jobLabId, setJobLabId] = useState('');
  const [jobScanId, setJobScanId] = useState('');
  const [jobTreatment, setJobTreatment] = useState<'crown' | 'bridge' | 'onlay' | 'implant' | 'orthodontics' | 'other'>('crown');
  const [jobStatus, setJobStatus] = useState<'pending' | 'in_design' | 'milling' | 'completed' | 'canceled'>('pending');
  const [jobDeliveryDate, setJobDeliveryDate] = useState('');
  const [jobNotes, setJobNotes] = useState('');
  const [jobCost, setJobCost] = useState(150);

  // Seed / Load Data on Init
  useEffect(() => {
    // Load Doctors
    const loadedDoctors = localStorage.getItem('pocketlab_doctors');
    if (loadedDoctors) {
      setDoctors(JSON.parse(loadedDoctors));
    } else {
      const initialDoctors: Doctor[] = [
        { id: 'DOC-1', name: 'Dr. Alejandro Tijerina', licenseNumber: 'CRO-5541890', specialty: 'Prosthodontics & CAD Designer', email: 'alejandro.t@clinicadental.com', phone: '+52 81 1234 5678', clinicName: 'PocketLab Smile Center Monterrey', createdAt: Date.now() },
        { id: 'DOC-2', name: 'Dra. Elena Ramos', licenseNumber: 'CRO-7721546', specialty: 'Oral Rehabilitator & Implantologist', email: 'elena.ramos@hospitalgallego.org', phone: '+52 81 9876 5432', clinicName: 'Odontología Estética San Pedro', createdAt: Date.now() }
      ];
      localStorage.setItem('pocketlab_doctors', JSON.stringify(initialDoctors));
      setDoctors(initialDoctors);
    }

    // Load Patients
    const loadedPatients = localStorage.getItem('pocketlab_patients');
    if (loadedPatients) {
      setPatients(JSON.parse(loadedPatients));
    } else {
      const initialPatients: Patient[] = [
        { id: 'PAT-1', name: 'Héctor Garza Meléndez', clinicalId: 'EXP-2026-9081', birthDate: '1985-04-12', gender: 'M', notes: 'Molar 36 con endodoncia previa. Requiere rehabilitación mediante corona de Zirconio monolítica fresada.', createdAt: Date.now() },
        { id: 'PAT-2', name: 'María de Alba Rodríguez', clinicalId: 'EXP-1992-0414', birthDate: '1992-11-28', gender: 'F', notes: 'Puente anterior fijo en órganos 11-12-13. Encía sana. Sensibilidad mínima al frío.', createdAt: Date.now() }
      ];
      localStorage.setItem('pocketlab_patients', JSON.stringify(initialPatients));
      setPatients(initialPatients);
    }

    // Load Labs
    const loadedLabs = localStorage.getItem('pocketlab_laboratories');
    if (loadedLabs) {
      setLaboratories(JSON.parse(loadedLabs));
    } else {
      const initialLabs: Laboratory[] = [
        { id: 'LAB-1', name: 'Sirona Premium Lab Monterrey', directorName: 'T.D. Roberto Cavazos', address: 'Av. Vasconcelos 455, San Pedro Garza García, NL', email: 'roberto@sironapremium.mx', phone: '+52 81 2233 4455', exocadCertified: true, createdAt: Date.now() },
        { id: 'LAB-2', name: 'OdontoCAD Digital Laboratory', directorName: 'T.D. Gabriela Esparza', address: 'Calle 10 de Mayo #115, Col. Centro, Monterrey, NL', email: 'gabriela.esparza@odontocad.com', phone: '+52 81 5566 7788', exocadCertified: true, createdAt: Date.now() }
      ];
      localStorage.setItem('pocketlab_laboratories', JSON.stringify(initialLabs));
      setLaboratories(initialLabs);
    }

    // Load Scans
    const rawScans = localStorage.getItem('pocketlab_scans');
    if (rawScans) {
      const parsedScans = JSON.parse(rawScans) as ScanResult[];
      setAvailableScans(parsedScans);
    }

    // Load Jobs
    const loadedJobs = localStorage.getItem('pocketlab_jobs');
    if (loadedJobs) {
      setJobs(JSON.parse(loadedJobs));
    } else {
      const initialJobs: DentalWorkOrder[] = [
        { id: 'JOB-1', doctorId: 'DOC-1', patientId: 'PAT-1', laboratoryId: 'LAB-1', scanId: 'SCAN-1716503000000', treatmentType: 'crown', status: 'milling', deliveryDate: '2026-05-30', notes: 'Corona anatómica molar 36 Exocad Ready. Margen cervical nítido en archivo PLY asignado.', cost: 180, createdAt: Date.now() },
        { id: 'JOB-2', doctorId: 'DOC-2', patientId: 'PAT-2', laboratoryId: 'LAB-2', scanId: 'SCAN-1716584000000', treatmentType: 'bridge', status: 'in_design', deliveryDate: '2026-06-03', notes: 'Puente anterior 12 al 14. Ajustar puntos de contacto proximales a 40 micras.', cost: 350, createdAt: Date.now() }
      ];
      localStorage.setItem('pocketlab_jobs', JSON.stringify(initialJobs));
      setJobs(initialJobs);
    }
  }, []);

  // Sync state functions
  const saveDoctors = (list: Doctor[]) => {
    localStorage.setItem('pocketlab_doctors', JSON.stringify(list));
    setDoctors(list);
  };
  const savePatients = (list: Patient[]) => {
    localStorage.setItem('pocketlab_patients', JSON.stringify(list));
    setPatients(list);
  };
  const saveLabs = (list: Laboratory[]) => {
    localStorage.setItem('pocketlab_laboratories', JSON.stringify(list));
    setLaboratories(list);
  };
  const saveJobs = (list: DentalWorkOrder[]) => {
    localStorage.setItem('pocketlab_jobs', JSON.stringify(list));
    setJobs(list);
  };

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // CRUD Actions
  const handleAddNewClick = () => {
    setEditingId(null);
    setIsFormOpen(true);
    
    // Clear fields
    if (activeTab === 'doctors') {
      setDocName(''); setDocLicense(''); setDocSpecialty(''); setDocEmail(''); setDocPhone(''); setDocClinic('');
    } else if (activeTab === 'patients') {
      setPatName(''); setPatClinicalId('EXP-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 9000 + 1000)); setPatBirthDate('1990-01-01'); setPatGender('M'); setPatNotes('');
    } else if (activeTab === 'labs') {
      setLabName(''); setLabDirector(''); setLabAddress(''); setLabEmail(''); setLabPhone(''); setLabExocad(true);
    } else if (activeTab === 'jobs') {
      setJobDocId(doctors[0]?.id || ''); setJobPatId(patients[0]?.id || ''); setJobLabId(laboratories[0]?.id || ''); setJobScanId(availableScans[0]?.id || ''); setJobTreatment('crown'); setJobStatus('pending'); setJobDeliveryDate(new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]); setJobNotes(''); setJobCost(150);
    }
  };

  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setIsFormOpen(true);

    if (activeTab === 'doctors') {
      const d = item as Doctor;
      setDocName(d.name); setDocLicense(d.licenseNumber); setDocSpecialty(d.specialty); setDocEmail(d.email); setDocPhone(d.phone); setDocClinic(d.clinicName);
    } else if (activeTab === 'patients') {
      const p = item as Patient;
      setPatName(p.name); setPatClinicalId(p.clinicalId); setPatBirthDate(p.birthDate); setPatGender(p.gender); setPatNotes(p.notes);
    } else if (activeTab === 'labs') {
      const l = item as Laboratory;
      setLabName(l.name); setLabDirector(l.directorName); setLabAddress(l.address); setLabEmail(l.email); setLabPhone(l.phone); setLabExocad(l.exocadCertified);
    } else if (activeTab === 'jobs') {
      const j = item as DentalWorkOrder;
      setJobDocId(j.doctorId); setJobPatId(j.patientId); setJobLabId(j.laboratoryId); setJobScanId(j.scanId || ''); setJobTreatment(j.treatmentType); setJobStatus(j.status); setJobDeliveryDate(j.deliveryDate); setJobNotes(j.notes); setJobCost(j.cost || 150);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(lang === 'es' ? '¿Desea eliminar permanentemente este registro?' : 'Are you sure you want to delete this record?')) {
      if (activeTab === 'doctors') {
        const next = doctors.filter(x => x.id !== id);
        saveDoctors(next);
      } else if (activeTab === 'patients') {
        const next = patients.filter(x => x.id !== id);
        savePatients(next);
      } else if (activeTab === 'labs') {
        const next = laboratories.filter(x => x.id !== id);
        saveLabs(next);
      } else if (activeTab === 'jobs') {
        const next = jobs.filter(x => x.id !== id);
        saveJobs(next);
      }
      triggerToast(lang === 'es' ? "Registro eliminado correctamente." : "Record deleted successfully.");
    }
  };

  const handleFormSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'doctors') {
      if (!docName.trim()) return alert("Name is required");
      if (editingId) {
        const arr = doctors.map(x => x.id === editingId ? { ...x, name: docName, licenseNumber: docLicense, specialty: docSpecialty, email: docEmail, phone: docPhone, clinicName: docClinic } : x);
        saveDoctors(arr);
        triggerToast("Doctor actualizado.");
      } else {
        const newDoc: Doctor = {
          id: 'DOC-' + Date.now(),
          name: docName,
          licenseNumber: docLicense,
          specialty: docSpecialty,
          email: docEmail,
          phone: docPhone,
          clinicName: docClinic,
          createdAt: Date.now()
        };
        saveDoctors([...doctors, newDoc]);
        triggerToast("Doctor registrado.");
      }
    } else if (activeTab === 'patients') {
      if (!patName.trim()) return alert("Name is required");
      if (editingId) {
        const arr = patients.map(x => x.id === editingId ? { ...x, name: patName, clinicalId: patClinicalId, birthDate: patBirthDate, gender: patGender, notes: patNotes } : x);
        savePatients(arr);
        triggerToast("Ficha de paciente actualizada.");
      } else {
        const newPat: Patient = {
          id: 'PAT-' + Date.now(),
          name: patName,
          clinicalId: patClinicalId,
          birthDate: patBirthDate,
          gender: patGender,
          notes: patNotes,
          createdAt: Date.now()
        };
        savePatients([...patients, newPat]);
        triggerToast("Paciente incorporado.");
      }
    } else if (activeTab === 'labs') {
      if (!labName.trim()) return alert("Laboratory Name is required");
      if (editingId) {
        const arr = laboratories.map(x => x.id === editingId ? { ...x, name: labName, directorName: labDirector, address: labAddress, email: labEmail, phone: labPhone, exocadCertified: labExocad } : x);
        saveLabs(arr);
        triggerToast("Laboratorio actualizado.");
      } else {
        const newLab: Laboratory = {
          id: 'LAB-' + Date.now(),
          name: labName,
          directorName: labDirector,
          address: labAddress,
          email: labEmail,
          phone: labPhone,
          exocadCertified: labExocad,
          createdAt: Date.now()
        };
        saveLabs([...laboratories, newLab]);
        triggerToast("Laboratorio registrado con éxito.");
      }
    } else if (activeTab === 'jobs') {
      if (editingId) {
        const arr = jobs.map(x => x.id === editingId ? { ...x, doctorId: jobDocId, patientId: jobPatId, laboratoryId: jobLabId, scanId: jobScanId || undefined, treatmentType: jobTreatment, status: jobStatus, deliveryDate: jobDeliveryDate, notes: jobNotes, cost: Number(jobCost) } : x);
        saveJobs(arr);
        triggerToast("Orden de maquila actualizada.");
      } else {
        const newJob: DentalWorkOrder = {
          id: 'JOB-' + Date.now(),
          doctorId: jobDocId,
          patientId: jobPatId,
          laboratoryId: jobLabId,
          scanId: jobScanId || undefined,
          treatmentType: jobTreatment,
          status: jobStatus,
          deliveryDate: jobDeliveryDate,
          notes: jobNotes,
          cost: Number(jobCost),
          createdAt: Date.now()
        };
        saveJobs([...jobs, newJob]);
        triggerToast("Orden de servicio CAD/CAM liberada al laboratorio.");
      }
    }

    setIsFormOpen(false);
    setEditingId(null);
  };

  // SQL Script Exporter for Supabase setup
  const handleExportSQL = () => {
    const sqlScript = `-- ⚙️ POCKETLAB DENTAL DDL & TRANSITION TO SUPABASE / POSTGRESQL SCHEMA
-- Generated clinically for Case Synchronization and Github-Ready workflows

-- 1. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE DOCTORS TABLE
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    specialty VARCHAR(150),
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(50),
    clinic_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CREATE PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    clinical_id VARCHAR(100) UNIQUE NOT NULL,
    birth_date DATE,
    gender CHAR(1) CHECK (gender IN ('M', 'F', 'O')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CREATE LABORATORIES TABLE
CREATE TABLE IF NOT EXISTS laboratories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    director_name VARCHAR(255),
    address TEXT,
    email VARCHAR(150),
    phone VARCHAR(50),
    exocad_certified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. CREATE 3D SCANS METADATA TABLE
CREATE TABLE IF NOT EXISTS scans_metadata (
    id VARCHAR(100) PRIMARY KEY, -- Match PocketLab local SCAN-XXXX IDs
    stl_url TEXT,
    obj_url TEXT,
    ply_url TEXT,
    preview_url TEXT,
    accuracy NUMERIC(5,4) DEFAULT 0.9850,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CREATE WORK ORDERS (JOBS) TABLE WITH INTRINSIC CONSTRAINTS
CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    laboratory_id UUID REFERENCES laboratories(id) ON DELETE SET NULL,
    scan_id VARCHAR(100) REFERENCES scans_metadata(id) ON DELETE SET NULL,
    treatment_type VARCHAR(50) CHECK (treatment_type IN ('crown', 'bridge', 'onlay', 'implant', 'orthodontics', 'other')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_design', 'milling', 'completed', 'canceled')),
    delivery_date DATE,
    notes TEXT,
    cost NUMERIC(10,2) DEFAULT 150.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SECURITY POLICIES (Row Level Security - RLS)
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

-- 8. INDEXES FOR HIGH-FIDELITY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_order_patient ON work_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_order_doctor ON work_orders(doctor_id);
CREATE INDEX IF NOT EXISTS idx_order_status ON work_orders(status);
`;

    const blob = new Blob([sqlScript], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pocketlab_supabase_tables.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast(lang === 'es' ? "¡SQL de Supabase generado para migración!" : "Supabase setup SQL generated!");
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Dynamic Alert */}
      {notification && (
        <div className="fixed top-24 right-6 bg-emerald-950 border border-emerald-500/50 text-emerald-300 px-5 py-3 rounded-2xl z-[100] flex items-center gap-2 shadow-2xl font-bold text-xs animate-in slide-in-from-right">
          <span>🛡️</span>
          <span>{notification}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent flex items-center gap-2.5">
            <Database className="w-6 h-6 text-blue-500" />
            {t.title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">{t.subtitle}</p>
        </div>
        
        {/* Supabase Action Group */}
        <button 
          onClick={handleExportSQL}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all w-full md:w-auto"
        >
          <Server className="w-4 h-4 text-emerald-200" />
          {t.actions.exportDb}
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 gap-2">
        <button
          onClick={() => { setActiveTab('doctors'); setIsFormOpen(false); }}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'doctors' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <User className="w-4 h-4" />
          {t.tabs.doctors}
          <span className="font-mono bg-black/30 text-[10px] px-1.5 py-0.5 rounded ml-1 text-slate-300">{doctors.length}</span>
        </button>
        <button
          onClick={() => { setActiveTab('patients'); setIsFormOpen(false); }}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'patients' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <User className="w-4 h-4" style={{ transform: 'scale(0.95)' }} />
          {t.tabs.patients}
          <span className="font-mono bg-black/30 text-[10px] px-1.5 py-0.5 rounded ml-1 text-slate-300">{patients.length}</span>
        </button>
        <button
          onClick={() => { setActiveTab('labs'); setIsFormOpen(false); }}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'labs' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Building className="w-4 h-4" />
          {t.tabs.labs}
          <span className="font-mono bg-black/30 text-[10px] px-1.5 py-0.5 rounded ml-1 text-slate-300">{laboratories.length}</span>
        </button>
        <button
          onClick={() => { setActiveTab('jobs'); setIsFormOpen(false); }}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'jobs' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          {t.tabs.jobs}
          <span className="font-mono bg-black/30 text-[10px] px-1.5 py-0.5 rounded ml-1 text-slate-300">{jobs.length}</span>
        </button>
      </div>

      {/* Active Editor Panel or Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Form panel (shows on top or side depending on open state) */}
        {isFormOpen && (
          <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
            <h3 className="text-sm font-black uppercase text-blue-400 tracking-wider mb-4 border-b border-slate-800 pb-2">
              {editingId ? (lang === 'es' ? 'Editar Registro Activo' : 'Edit Selected Record') : t.actions.addNew} ({activeTab.toUpperCase()})
            </h3>
            
            <form onSubmit={handleFormSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Active form: Doctors */}
              {activeTab === 'doctors' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.doctorFields.name}</label>
                    <input type="text" value={docName} onChange={e => setDocName(e.target.value)} placeholder={t.doctorFields.placeholderName} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.doctorFields.license}</label>
                    <input type="text" value={docLicense} onChange={e => setDocLicense(e.target.value)} placeholder="CRO-123456" className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.doctorFields.specialty}</label>
                    <input type="text" value={docSpecialty} onChange={e => setDocSpecialty(e.target.value)} placeholder={t.doctorFields.placeholderSpecialty} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.doctorFields.email}</label>
                    <input type="email" value={docEmail} onChange={e => setDocEmail(e.target.value)} placeholder="email@clinica.com" className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.doctorFields.phone}</label>
                    <input type="text" value={docPhone} onChange={e => setDocPhone(e.target.value)} placeholder="+52 ..." className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.doctorFields.clinic}</label>
                    <input type="text" value={docClinic} onChange={e => setDocClinic(e.target.value)} placeholder="Smile Clinic" className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                </>
              )}

              {/* Active form: Patients */}
              {activeTab === 'patients' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.patientFields.name}</label>
                    <input type="text" value={patName} onChange={e => setPatName(e.target.value)} placeholder={t.patientFields.placeholderName} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.patientFields.clinicalId}</label>
                    <input type="text" value={patClinicalId} onChange={e => setPatClinicalId(e.target.value)} placeholder="EXP-2026-X" className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.patientFields.birthDate}</label>
                    <input type="date" value={patBirthDate} onChange={e => setPatBirthDate(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.patientFields.gender}</label>
                    <select value={patGender} onChange={e => setPatGender(e.target.value as any)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                      <option value="M">Masculino / Male</option>
                      <option value="F">Femenino / Female</option>
                      <option value="O">Otro / Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.patientFields.notes}</label>
                    <input type="text" value={patNotes} onChange={e => setPatNotes(e.target.value)} placeholder="Notas de anamnesis, alergias, piezas a tratar..." className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                </>
              )}

              {/* Active form: Labs */}
              {activeTab === 'labs' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.labFields.name}</label>
                    <input type="text" value={labName} onChange={e => setLabName(e.target.value)} placeholder="Epic Labs MTY" className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.labFields.director}</label>
                    <input type="text" value={labDirector} onChange={e => setLabDirector(e.target.value)} placeholder="T.D. Roberto Cavazos" className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.actions.status}</label>
                    <div className="flex items-center gap-2 mt-2">
                      <input type="checkbox" checked={labExocad} onChange={e => setLabExocad(e.target.checked)} id="exocad-cert" className="w-4 h-4 accent-blue-600 rounded" />
                      <label htmlFor="exocad-cert" className="text-xs text-slate-200 font-bold">{t.labFields.exocad}</label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">E-mail</label>
                    <input type="email" value={labEmail} onChange={e => setLabEmail(e.target.value)} placeholder="lab@odontocad.com" className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Phone</label>
                    <input type="text" value={labPhone} onChange={e => setLabPhone(e.target.value)} placeholder="+52 ..." className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.labFields.address}</label>
                    <input type="text" value={labAddress} onChange={e => setLabAddress(e.target.value)} placeholder="Vasconcelos 100, MTY" className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                </>
              )}

              {/* Active form: Work Orders (Jobs) */}
              {activeTab === 'jobs' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.jobFields.doctor}</label>
                    <select value={jobDocId} onChange={e => setJobDocId(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" required>
                      <option value="">-- Seleccionar Médico --</option>
                      {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.jobFields.patient}</label>
                    <select value={jobPatId} onChange={e => setJobPatId(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" required>
                      <option value="">-- Seleccionar Paciente --</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.clinicalId})</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.jobFields.lab}</label>
                    <select value={jobLabId} onChange={e => setJobLabId(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" required>
                      <option value="">-- Seleccionar Laboratorio --</option>
                      {laboratories.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Vincular Escaneo 3D (CAD)</label>
                    <select value={jobScanId} onChange={e => setJobScanId(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                      <option value="">-- Sin Escaneo Vinculado --</option>
                      {availableScans.map(s => <option key={s.id} value={s.id}>{s.id} [Accuracy: {(s.accuracy*100).toFixed(1)}%]</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.jobFields.treatment}</label>
                    <select value={jobTreatment} onChange={e => setJobTreatment(e.target.value as any)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                      {Object.entries(t.jobFields.treatments).map(([key, val]) => <option key={key} value={key}>{val}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.jobFields.status}</label>
                    <select value={jobStatus} onChange={e => setJobStatus(e.target.value as any)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                      {Object.entries(t.jobFields.states).map(([key, val]) => <option key={key} value={key}>{val}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.jobFields.delivery}</label>
                    <input type="date" value={jobDeliveryDate} onChange={e => setJobDeliveryDate(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.jobFields.cost}</label>
                    <input type="number" value={jobCost} onChange={e => setJobCost(Number(e.target.value))} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t.jobFields.notes}</label>
                    <input type="text" value={jobNotes} onChange={e => setJobNotes(e.target.value)} placeholder="Instrucciones clínicas, color vita master, nivel de oclusión..." className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                </>
              )}

              {/* Form Action Controls */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex items-center justify-end gap-3 border-t border-slate-800 pt-4 mt-2">
                <button 
                  type="button" 
                  onClick={() => { setIsFormOpen(false); setEditingId(null); }}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs transition-all"
                >
                  {t.actions.cancel}
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-lg shadow-blue-500/10 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {t.actions.save}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Content Catalogs - Doctors Tab */}
        {activeTab === 'doctors' && !isFormOpen && (
          <div className="lg:col-span-12 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cuerpo Médico de la Clínica ({doctors.length})</span>
              <button 
                onClick={handleAddNewClick}
                className="bg-blue-600/25 hover:bg-blue-600/35 border border-blue-500/35 text-blue-300 text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                {t.actions.addNew}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map(d => (
                <div key={d.id} className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700 flex flex-col justify-between hover:border-slate-600 transition-all">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span className="text-blue-400 text-base">🩺</span>
                        {d.name}
                      </h4>
                      <span className="text-[10px] font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded-md font-bold">{d.licenseNumber}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5 font-bold">{d.specialty}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{d.clinicName}</p>
                    <div className="border-t border-slate-800/50 mt-3 pt-3 space-y-1">
                      <p className="text-[10px] font-mono text-slate-400">📧 {d.email}</p>
                      <p className="text-[10px] font-mono text-slate-400">📞 {d.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2.5 border-t border-slate-800/50 mt-4 pt-3">
                    <button onClick={() => handleEditClick(d)} className="text-slate-400 hover:text-white text-xs font-bold py-1 px-2.5 rounded hover:bg-slate-700/50 transition-all flex items-center gap-1">
                      <Edit2 className="w-3.5 h-3.5" />
                      {t.actions.edit}
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="text-red-400 hover:text-red-300 text-xs font-bold py-1 px-2.5 rounded hover:bg-red-950/20 transition-all flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" />
                      {t.actions.delete}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Catalogs - Patients Tab */}
        {activeTab === 'patients' && !isFormOpen && (
          <div className="lg:col-span-12 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Historial de Expedientes ({patients.length})</span>
              <button 
                onClick={handleAddNewClick}
                className="bg-blue-600/25 hover:bg-blue-600/35 border border-blue-500/35 text-blue-300 text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                {t.actions.addNew}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patients.map(p => (
                <div key={p.id} className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700 flex flex-col justify-between hover:border-slate-600 transition-all">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span className="text-indigo-400">👤</span>
                        {p.name}
                      </h4>
                      <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-md font-bold">{p.clinicalId}</span>
                    </div>
                    <div className="flex gap-4 mt-2 text-[10px] text-slate-400 font-mono">
                      <span>Nacimiento: {p.birthDate}</span>
                      <span>Sexo: {p.gender === 'M' ? 'Masculino' : p.gender === 'F' ? 'Femenino' : 'Otro'}</span>
                    </div>
                    <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80 mt-3">
                      <p className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Diagnóstico / Clínico:</p>
                      <p className="text-[11.5px] text-zinc-300 leading-snug mt-1">{p.notes}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2.5 border-t border-slate-800/50 mt-4 pt-3">
                    <button onClick={() => handleEditClick(p)} className="text-slate-400 hover:text-white text-xs font-bold py-1 px-2.5 rounded hover:bg-slate-700/50 transition-all flex items-center gap-1">
                      <Edit2 className="w-3.5 h-3.5" />
                      {t.actions.edit}
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 text-xs font-bold py-1 px-2.5 rounded hover:bg-red-950/20 transition-all flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" />
                      {t.actions.delete}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Catalogs - Laboratories Tab */}
        {activeTab === 'labs' && !isFormOpen && (
          <div className="lg:col-span-12 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Laboratorios Dentales Vinculados ({laboratories.length})</span>
              <button 
                onClick={handleAddNewClick}
                className="bg-blue-600/25 hover:bg-blue-600/35 border border-blue-500/35 text-blue-300 text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                {t.actions.addNew}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {laboratories.map(l => (
                <div key={l.id} className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700 flex flex-col justify-between hover:border-slate-600 transition-all">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span className="text-emerald-400 text-base">🏢</span>
                        {l.name}
                      </h4>
                      {l.exocadCertified && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-950 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded">Exocad Certified</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{l.directorName} (Director Técnico)</p>
                    <p className="text-xs text-slate-400 mt-2">📍 {l.address}</p>
                    <div className="border-t border-slate-800/50 mt-3 pt-3 space-y-1">
                      <p className="text-[10px] font-mono text-slate-400">📧 {l.email}</p>
                      <p className="text-[10px] font-mono text-slate-400">📞 {l.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2.5 border-t border-slate-800/50 mt-4 pt-3">
                    <button onClick={() => handleEditClick(l)} className="text-slate-400 hover:text-white text-xs font-bold py-1 px-2.5 rounded hover:bg-slate-700/50 transition-all flex items-center gap-1">
                      <Edit2 className="w-3.5 h-3.5" />
                      {t.actions.edit}
                    </button>
                    <button onClick={() => handleDelete(l.id)} className="text-red-400 hover:text-red-300 text-xs font-bold py-1 px-2.5 rounded hover:bg-red-950/20 transition-all flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" />
                      {t.actions.delete}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Catalogs - Jobs / Work Orders Tab */}
        {activeTab === 'jobs' && !isFormOpen && (
          <div className="lg:col-span-12 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Órdenes Activas de Fresado e Impresión CAD/CAM ({jobs.length})</span>
              <button 
                onClick={handleAddNewClick}
                className="bg-blue-600/25 hover:bg-blue-600/35 border border-blue-500/35 text-blue-300 text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                {t.actions.addNew}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {jobs.map(j => {
                const doc = doctors.find(x => x.id === j.doctorId);
                const pat = patients.find(x => x.id === j.patientId);
                const lab = laboratories.find(x => x.id === j.laboratoryId);
                
                let orderStatusStyle = "border-amber-500/30 text-amber-300 bg-amber-950/40";
                if (j.status === 'completed') orderStatusStyle = "border-emerald-500/30 text-emerald-300 bg-emerald-950/40";
                if (j.status === 'in_design') orderStatusStyle = "border-blue-500/30 text-blue-300 bg-blue-950/40";
                if (j.status === 'canceled') orderStatusStyle = "border-red-500/30 text-red-300 bg-red-950/40";

                return (
                  <div key={j.id} className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">💎</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-400 font-mono">ORDEN: {j.id.slice(-8).toUpperCase()}</span>
                          <span className="text-[13px] font-bold text-white">{t.jobFields.treatments[j.treatmentType]}</span>
                        </div>
                      </div>
                      
                      {/* Connection status tag */}
                      <div className="flex items-center gap-2">
                        {j.scanId ? (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold bg-blue-950/80 border border-blue-500/30 text-blue-300 px-2.5 py-1 rounded-xl">
                            <span className="animate-pulse">💎</span>
                            <span>Model 3D Linked ({j.scanId.slice(-8)})</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-zinc-500 border border-zinc-800 px-2 py-1 rounded-xl font-mono">
                            No 3D Scan Attached
                          </div>
                        )}
                        
                        <span className={`text-[10px] font-black uppercase tracking-wider border px-2.5 py-1 rounded-xl ${orderStatusStyle}`}>
                          {t.jobFields.states[j.status]}
                        </span>
                      </div>
                    </div>

                    {/* ERP Multi-link layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
                        <p className="text-[9px] font-black uppercase text-indigo-400 tracking-wider mb-1">Médico Prescriptor</p>
                        <p className="font-bold text-slate-200">{doc ? doc.name : "Desconocido"}</p>
                        <p className="text-[10px] text-slate-400">{doc ? doc.licenseNumber : ""}</p>
                      </div>
                      <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
                        <p className="text-[9px] font-black uppercase text-indigo-400 tracking-wider mb-1">Candidato / Paciente</p>
                        <p className="font-bold text-slate-200">{pat ? pat.name : "Desconocido"}</p>
                        <p className="text-[10px] text-slate-400">{pat ? pat.clinicalId : ""}</p>
                      </div>
                      <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
                        <p className="text-[9px] font-black uppercase text-indigo-400 tracking-wider mb-1">Taller de Maquila / Lab</p>
                        <p className="font-bold text-slate-200">{lab ? lab.name : "Desconocido"}</p>
                        <p className="text-[10px] text-slate-400">{lab ? lab.directorName : ""}</p>
                      </div>
                    </div>

                    <div className="bg-slate-900/20 p-3 rounded-xl border border-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-semibold text-slate-400">Prescripción de Maquila:</span>
                        <p className="text-slate-300 italic text-[11.5px] mt-0.5">"{j.notes}"</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 font-mono text-[11px] font-bold">
                        <span className="text-zinc-500">Costo: <b className="text-emerald-400">${j.cost} USD</b></span>
                        <span className="text-blue-300">Entrega: {j.deliveryDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 border-t border-slate-800/50 pt-3">
                      <button onClick={() => handleEditClick(j)} className="text-slate-400 hover:text-white text-xs font-bold py-1 px-2.5 rounded hover:bg-slate-700/50 transition-all flex items-center gap-1">
                        <Edit2 className="w-3.5 h-3.5" />
                        {t.actions.edit}
                      </button>
                      <button onClick={() => handleDelete(j.id)} className="text-red-400 hover:text-red-300 text-xs font-bold py-1 px-2.5 rounded hover:bg-red-950/20 transition-all flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" />
                        {t.actions.delete}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RegistriesView;
