import { ReurbValidationService } from '../src/modules/reurb/reurb-validation.service';

describe('reurb validation service', () => {
  const service = new ReurbValidationService();

  it('blocks deliverable when mandatory fields are missing and there are open pendencies', () => {
    const result = service.validateBeforeDeliverable({
      action: 'GENERATE_PLANILHA',
      config: {
        reurbEnabled: true,
        requiredFamilyFields: ['cpf'],
        spreadsheet: {
          templateVersion: 'v1',
          columns: [],
        },
        documentNaming: {
          familyFolder: 'familias',
          spreadsheetFolder: 'planilha',
          titlesFolder: 'titulos',
          approvedDocumentsFolder: 'documentos_aprovados',
          requiredDocumentTypes: [],
        },
        validationRules: {
          blockOnPendingDocumentIssues: true,
          requireAptaStatusForExports: false,
          requireAptaStatusForCartorioPackage: true,
          failOnMissingRequiredFields: true,
        },
      } as never,
      families: [
        {
          id: 'fam-1',
          familyCode: 'FAM-001',
          nucleus: 'N1',
          responsibleName: 'Ana',
          status: 'PENDENTE',
          data: {},
        } as never,
      ],
      pendencies: [
        {
          id: 'p-1',
          documentType: 'RG',
          status: 'ABERTA',
        } as never,
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.errors.some((item) => item.code === 'MISSING_REQUIRED_FIELD')).toBe(true);
    expect(result.errors.some((item) => item.code === 'OPEN_DOCUMENT_PENDENCY')).toBe(true);
  });
});
