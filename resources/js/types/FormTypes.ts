export interface AdmissionFormField {
    id: number;
    section_id: number;
    field_type: string;
    label: string;
    name: string;
    placeholder?: string;
    options?: string[] | null;
    is_required: boolean;
    grid_width: number;
    order: number;
    validation_rules?: string[] | null;
}

export interface AdmissionFormSection {
    id: number;
    title: string;
    description?: string;
    order: number;
    fields: AdmissionFormField[];
}

export interface AdmissionForm {
    id: number;
    title: string;
    description?: string;
    short_code: string;
    sections: AdmissionFormSection[];
}
