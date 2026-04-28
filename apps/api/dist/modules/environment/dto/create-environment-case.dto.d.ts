export declare class CreateEnvironmentCaseDto {
    title: string;
    category: 'APP' | 'PODA' | 'ARVORE' | 'LAUDO' | 'OS' | 'LICENCA';
    projectId?: string;
    tasks?: string[];
}
