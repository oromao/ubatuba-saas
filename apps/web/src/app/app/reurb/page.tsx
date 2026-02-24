"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

type TenantConfig = {
  reurbEnabled: boolean;
  spreadsheet?: { templateVersion?: string; columns?: Array<{ key: string; label: string; required?: boolean }> };
  documentNaming?: {
    requiredDocumentTypes?: string[];
    requiredProjectDocumentTypes?: string[];
    requiredUnitDocumentTypes?: string[];
  };
};

type ReurbProject = {
  id: string;
  name: string;
  status: string;
  area?: string;
  reurbType?: string;
};

type Family = {
  id: string;
  familyCode: string;
  nucleus: string;
  responsibleName: string;
  cpf?: string;
  status: "APTA" | "PENDENTE" | "IRREGULAR";
};

type Unit = {
  id: string;
  code: string;
  block?: string;
  lot?: string;
  address?: string;
};

type Pendency = {
  id: string;
  nucleus: string;
  documentType: string;
  missingDocument: string;
  status: "ABERTA" | "EM_ANALISE" | "RESOLVIDA";
  responsible: string;
};

type Deliverable = {
  id: string;
  kind: string;
  version: number;
  fileName: string;
  generatedAt: string;
  hashSha256: string;
};

type NotificationTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  version: number;
  isActive: boolean;
  variables?: string[];
};

type Notification = {
  id: string;
  templateName: string;
  channel: string;
  to: string;
  status: string;
  sentAt?: string;
  createdAt?: string;
};

type DossierSummary = {
  project: { id: string; name: string; status: string; missingDocuments: string[] };
  families: Array<{ familyId: string; missing: string[] }>;
  units: Array<{ unitId: string; missing: string[] }>;
};

export default function ReurbPage() {
  const queryClient = useQueryClient();
  const getId = (item: { id?: string; _id?: string }) => item.id ?? item._id ?? "";
  const [q, setQ] = useState("");
  const [projectId, setProjectId] = useState("");
  const projectIdSafe = typeof projectId === "string" ? projectId : "";
  const [newFamily, setNewFamily] = useState({
    familyCode: "",
    nucleus: "",
    responsibleName: "",
    cpf: "",
    status: "PENDENTE" as "APTA" | "PENDENTE" | "IRREGULAR",
  });
  const [newProject, setNewProject] = useState({
    name: "",
    area: "",
  });
  const [newUnit, setNewUnit] = useState({
    code: "",
    block: "",
    lot: "",
    address: "",
  });
  const [templateDraft, setTemplateDraft] = useState({
    name: "",
    subject: "",
    body: "",
  });
  const [notificationDraft, setNotificationDraft] = useState({
    templateId: "",
    to: "",
    variablesJson: "{}",
  });
  const [docDraft, setDocDraft] = useState({
    familyId: "",
    familyDocumentType: "",
    projectDocumentType: "",
    unitId: "",
    unitDocumentType: "",
  });
  const [familyDocFile, setFamilyDocFile] = useState<File | null>(null);
  const [projectDocFile, setProjectDocFile] = useState<File | null>(null);
  const [unitDocFile, setUnitDocFile] = useState<File | null>(null);
  const [evidenceDraft, setEvidenceDraft] = useState({
    notificationId: "",
  });
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [csvPayload, setCsvPayload] = useState("familyCode,nucleus,responsibleName,cpf,address");

  const configQuery = useQuery({
    queryKey: ["reurb-config"],
    queryFn: () => apiFetch<TenantConfig>("/reurb/tenant-config"),
  });

  const projectsQuery = useQuery({
    queryKey: ["reurb-projects"],
    queryFn: () => apiFetch<ReurbProject[]>("/reurb/projects"),
  });

  const familiesQuery = useQuery({
    queryKey: ["reurb-families", q, projectIdSafe],
    queryFn: () =>
      apiFetch<Family[]>(
        `/reurb/families${projectIdSafe ? `?projectId=${projectIdSafe}&` : "?"}q=${encodeURIComponent(q)}`,
      ),
  });

  const pendenciesQuery = useQuery({
    queryKey: ["reurb-pendencies", projectIdSafe],
    queryFn: () =>
      apiFetch<Pendency[]>(`/reurb/pendencies${projectIdSafe ? `?projectId=${projectIdSafe}` : ""}`),
  });

  const deliverablesQuery = useQuery({
    queryKey: ["reurb-deliverables", projectIdSafe],
    queryFn: () =>
      apiFetch<Deliverable[]>(`/reurb/deliverables${projectIdSafe ? `?projectId=${projectIdSafe}` : ""}`),
  });

  const unitsQuery = useQuery({
    queryKey: ["reurb-units", projectIdSafe],
    queryFn: () => apiFetch<Unit[]>(`/reurb/units${projectIdSafe ? `?projectId=${projectIdSafe}` : ""}`),
    enabled: projectIdSafe.length > 0,
  });

  const templatesQuery = useQuery({
    queryKey: ["reurb-templates", projectIdSafe],
    queryFn: () =>
      apiFetch<NotificationTemplate[]>(
        `/reurb/notification-templates${projectIdSafe ? `?projectId=${projectIdSafe}` : ""}`,
      ),
    enabled: projectIdSafe.length > 0,
  });

  const notificationsQuery = useQuery({
    queryKey: ["reurb-notifications", projectIdSafe],
    queryFn: () =>
      apiFetch<Notification[]>(`/reurb/notifications${projectIdSafe ? `?projectId=${projectIdSafe}` : ""}`),
    enabled: projectIdSafe.length > 0,
  });

  const dossierQuery = useQuery({
    queryKey: ["reurb-dossier", projectIdSafe],
    queryFn: () =>
      apiFetch<DossierSummary>(`/reurb/dossier${projectIdSafe ? `?projectId=${projectIdSafe}` : ""}`),
    enabled: projectIdSafe.length > 0,
  });

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["reurb-projects"] }),
      queryClient.invalidateQueries({ queryKey: ["reurb-families"] }),
      queryClient.invalidateQueries({ queryKey: ["reurb-pendencies"] }),
      queryClient.invalidateQueries({ queryKey: ["reurb-units"] }),
      queryClient.invalidateQueries({ queryKey: ["reurb-deliverables"] }),
      queryClient.invalidateQueries({ queryKey: ["reurb-config"] }),
      queryClient.invalidateQueries({ queryKey: ["reurb-templates"] }),
      queryClient.invalidateQueries({ queryKey: ["reurb-notifications"] }),
      queryClient.invalidateQueries({ queryKey: ["reurb-dossier"] }),
    ]);
  };

  const reurbEnabled = Boolean(configQuery.data?.reurbEnabled);
  const hasProject = Boolean(projectIdSafe);

  const ensureReurbEnabled = () => {
    if (!reurbEnabled) {
      throw new Error("REURB esta desabilitado. Ative o modulo para continuar.");
    }
  };

  const ensureProjectSelected = () => {
    if (!projectIdSafe) {
      throw new Error("Selecione um projeto REURB para continuar.");
    }
  };

  const toggleReurb = useMutation({
    mutationFn: async () =>
      apiFetch("/reurb/tenant-config", {
        method: "PUT",
        body: JSON.stringify({ reurbEnabled: !configQuery.data?.reurbEnabled }),
      }),
    onSuccess: async () => {
      toast.success("Configuracao REURB atualizada.");
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao atualizar configuracao.");
    },
  });

  const createFamily = useMutation({
    mutationFn: async () => {
      ensureReurbEnabled();
      ensureProjectSelected();
      return apiFetch("/reurb/families", {
        method: "POST",
        body: JSON.stringify({
          projectId: projectIdSafe,
          ...newFamily,
        }),
      });
    },
    onSuccess: async () => {
      toast.success("Familia cadastrada.");
      setNewFamily({ familyCode: "", nucleus: "", responsibleName: "", cpf: "", status: "PENDENTE" });
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao cadastrar familia.");
    },
  });

  const createProject = useMutation({
    mutationFn: async () =>
      apiFetch("/reurb/projects", {
        method: "POST",
        body: JSON.stringify({
          name: newProject.name,
          area: newProject.area,
        }),
      }),
    onSuccess: async () => {
      toast.success("Projeto criado.");
      setNewProject({ name: "", area: "" });
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao criar projeto.");
    },
  });

  const createUnit = useMutation({
    mutationFn: async () => {
      ensureReurbEnabled();
      ensureProjectSelected();
      return apiFetch("/reurb/units", {
        method: "POST",
        body: JSON.stringify({
          projectId: projectIdSafe,
          code: newUnit.code,
          block: newUnit.block || undefined,
          lot: newUnit.lot || undefined,
          address: newUnit.address || undefined,
        }),
      });
    },
    onSuccess: async () => {
      toast.success("Unidade cadastrada.");
      setNewUnit({ code: "", block: "", lot: "", address: "" });
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao cadastrar unidade.");
    },
  });

  const importFamilies = useMutation({
    mutationFn: async () => {
      ensureReurbEnabled();
      ensureProjectSelected();
      return apiFetch("/reurb/families/import.csv", {
        method: "POST",
        body: JSON.stringify({ projectId: projectIdSafe, csvContent: csvPayload }),
      });
    },
    onSuccess: async (result) => {
      toast.success(`Importado: ${result.created}/${result.total}`);
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao importar CSV.");
    },
  });

  const generatePlanilha = useMutation({
    mutationFn: () => {
      ensureReurbEnabled();
      ensureProjectSelected();
      return apiFetch<Deliverable>("/reurb/planilha-sintese/generate", {
        method: "POST",
        body: JSON.stringify({ projectId: projectIdSafe }),
      });
    },
    onSuccess: async () => {
      toast.success("Planilha sintese gerada com sucesso.");
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao gerar planilha.");
    },
  });

  const generateCsv = useMutation({
    mutationFn: () => {
      ensureReurbEnabled();
      ensureProjectSelected();
      return apiFetch<Deliverable>("/reurb/families/export.csv", {
        method: "POST",
        body: JSON.stringify({ projectId: projectIdSafe }),
      });
    },
    onSuccess: async () => {
      toast.success("Banco tabulado CSV gerado.");
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao exportar CSV.");
    },
  });

  const generateJson = useMutation({
    mutationFn: () => {
      ensureReurbEnabled();
      ensureProjectSelected();
      return apiFetch<Deliverable>("/reurb/families/export.json", {
        method: "POST",
        body: JSON.stringify({ projectId: projectIdSafe }),
      });
    },
    onSuccess: async () => {
      toast.success("Banco tabulado JSON gerado.");
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao exportar JSON.");
    },
  });

  const generateZip = useMutation({
    mutationFn: () => {
      ensureReurbEnabled();
      ensureProjectSelected();
      return apiFetch<Deliverable>("/reurb/cartorio/package", {
        method: "POST",
        body: JSON.stringify({ projectId: projectIdSafe }),
      });
    },
    onSuccess: async () => {
      toast.success("Pacote do cartorio gerado.");
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao gerar pacote cartorio.");
    },
  });

  const createTemplate = useMutation({
    mutationFn: () =>
      apiFetch("/reurb/notification-templates", {
        method: "POST",
        body: JSON.stringify({
          projectId: projectIdSafe,
          name: templateDraft.name,
          subject: templateDraft.subject,
          body: templateDraft.body,
        }),
      }),
    onSuccess: async () => {
      toast.success("Template criado.");
      setTemplateDraft({ name: "", subject: "", body: "" });
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao criar template.");
    },
  });

  const sendNotification = useMutation({
    mutationFn: () => {
      let variables: Record<string, string | number> | undefined = undefined;
      if (notificationDraft.variablesJson.trim()) {
        variables = JSON.parse(notificationDraft.variablesJson);
      }
      return apiFetch("/reurb/notifications/send-email", {
        method: "POST",
        body: JSON.stringify({
          projectId: projectIdSafe,
          templateId: notificationDraft.templateId,
          to: notificationDraft.to,
          variables,
        }),
      });
    },
    onSuccess: async () => {
      toast.success("Notificacao enviada.");
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao enviar notificacao.");
    },
  });

  const uploadFileToPresignedUrl = async (url: string, method: string, headers: Record<string, string>, file: File) => {
    const response = await fetch(url, {
      method,
      headers,
      body: file,
    });
    if (!response.ok) {
      throw new Error("Falha ao enviar arquivo para o storage.");
    }
  };

  const uploadFamilyDocument = useMutation({
    mutationFn: async () => {
      if (!familyDocFile) throw new Error("Selecione um arquivo.");
      if (!docDraft.familyId) throw new Error("Selecione uma familia.");
      if (!docDraft.familyDocumentType) throw new Error("Informe o tipo de documento.");
      const presign = await apiFetch<{ url: string; method: string; headers: Record<string, string>; key: string }>(
        "/reurb/documents/presign-upload",
        {
          method: "POST",
          body: JSON.stringify({
            projectId: projectIdSafe,
            familyId: docDraft.familyId,
            documentType: docDraft.familyDocumentType,
            fileName: familyDocFile.name,
            mimeType: familyDocFile.type || undefined,
          }),
        },
      );
      await uploadFileToPresignedUrl(presign.url, presign.method, presign.headers ?? {}, familyDocFile);
      return apiFetch("/reurb/documents/complete-upload", {
        method: "POST",
        body: JSON.stringify({
          projectId: projectIdSafe,
          familyId: docDraft.familyId,
          documentType: docDraft.familyDocumentType,
          key: presign.key,
          fileName: familyDocFile.name,
        }),
      });
    },
    onSuccess: async () => {
      toast.success("Documento da familia enviado.");
      setFamilyDocFile(null);
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha no upload do documento.");
    },
  });

  const uploadProjectDocument = useMutation({
    mutationFn: async () => {
      if (!projectDocFile) throw new Error("Selecione um arquivo.");
      if (!docDraft.projectDocumentType) throw new Error("Informe o tipo de documento.");
      const presign = await apiFetch<{ url: string; method: string; headers: Record<string, string>; key: string }>(
        "/reurb/project-documents/presign-upload",
        {
          method: "POST",
          body: JSON.stringify({
            projectId: projectIdSafe,
            documentType: docDraft.projectDocumentType,
            fileName: projectDocFile.name,
            mimeType: projectDocFile.type || undefined,
          }),
        },
      );
      await uploadFileToPresignedUrl(presign.url, presign.method, presign.headers ?? {}, projectDocFile);
      return apiFetch("/reurb/project-documents/complete-upload", {
        method: "POST",
        body: JSON.stringify({
          projectId: projectIdSafe,
          documentType: docDraft.projectDocumentType,
          key: presign.key,
          fileName: projectDocFile.name,
        }),
      });
    },
    onSuccess: async () => {
      toast.success("Documento do projeto enviado.");
      setProjectDocFile(null);
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha no upload do documento do projeto.");
    },
  });

  const uploadUnitDocument = useMutation({
    mutationFn: async () => {
      if (!unitDocFile) throw new Error("Selecione um arquivo.");
      if (!docDraft.unitId) throw new Error("Selecione uma unidade.");
      if (!docDraft.unitDocumentType) throw new Error("Informe o tipo de documento.");
      const presign = await apiFetch<{ url: string; method: string; headers: Record<string, string>; key: string }>(
        "/reurb/unit-documents/presign-upload",
        {
          method: "POST",
          body: JSON.stringify({
            projectId: projectIdSafe,
            unitId: docDraft.unitId,
            documentType: docDraft.unitDocumentType,
            fileName: unitDocFile.name,
            mimeType: unitDocFile.type || undefined,
          }),
        },
      );
      await uploadFileToPresignedUrl(presign.url, presign.method, presign.headers ?? {}, unitDocFile);
      return apiFetch("/reurb/unit-documents/complete-upload", {
        method: "POST",
        body: JSON.stringify({
          projectId: projectIdSafe,
          unitId: docDraft.unitId,
          documentType: docDraft.unitDocumentType,
          key: presign.key,
          fileName: unitDocFile.name,
        }),
      });
    },
    onSuccess: async () => {
      toast.success("Documento da unidade enviado.");
      setUnitDocFile(null);
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha no upload do documento da unidade.");
    },
  });

  const uploadEvidence = useMutation({
    mutationFn: async () => {
      if (!evidenceFile) throw new Error("Selecione um arquivo.");
      if (!evidenceDraft.notificationId) throw new Error("Informe a notificacao.");
      const presign = await apiFetch<{ url: string; method: string; headers: Record<string, string>; key: string }>(
        "/reurb/notifications/evidence/presign-upload",
        {
          method: "POST",
          body: JSON.stringify({
            projectId: projectIdSafe,
            fileName: evidenceFile.name,
            mimeType: evidenceFile.type || undefined,
          }),
        },
      );
      await uploadFileToPresignedUrl(presign.url, presign.method, presign.headers ?? {}, evidenceFile);
      return apiFetch(`/reurb/notifications/${evidenceDraft.notificationId}/evidence`, {
        method: "POST",
        body: JSON.stringify({
          projectId: projectIdSafe,
          key: presign.key,
        }),
      });
    },
    onSuccess: async () => {
      toast.success("Evidencia anexada.");
      setEvidenceFile(null);
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao anexar evidencia.");
    },
  });

  const columnsText = useMemo(
    () =>
      (configQuery.data?.spreadsheet?.columns ?? [])
        .map((item) => `${item.label}${item.required ? "*" : ""}`)
        .join(", "),
    [configQuery.data?.spreadsheet?.columns],
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-8 py-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-on-surface">REURB</h1>
          <p className="text-sm text-on-surface-muted">
            Banco tabulado, planilha sintese, pendencias documentais e pacote cartorio por tenant.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={configQuery.data?.reurbEnabled ? "success" : "warning"}>
            {configQuery.data?.reurbEnabled ? "REURB habilitado" : "REURB desabilitado"}
          </Badge>
          <Button loading={toggleReurb.isPending} onClick={() => toggleReurb.mutate()}>
            {configQuery.data?.reurbEnabled ? "Desativar" : "Ativar"} REURB
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entregaveis obrigatorios</CardTitle>
          <CardDescription>
            Geracao bloqueada automaticamente quando houver inconsistencias de conformidade.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            loading={generatePlanilha.isPending}
            onClick={() => generatePlanilha.mutate()}
            disabled={!reurbEnabled || !hasProject}
          >
            Gerar Planilha Sintese
          </Button>
          <Button
            variant="outline"
            loading={generateCsv.isPending}
            onClick={() => generateCsv.mutate()}
            disabled={!reurbEnabled || !hasProject}
          >
            Exportar Banco Tabulado (CSV)
          </Button>
          <Button
            variant="outline"
            loading={generateJson.isPending}
            onClick={() => generateJson.mutate()}
            disabled={!reurbEnabled || !hasProject}
          >
            Exportar Banco Tabulado (JSON)
          </Button>
          <Button
            variant="outline"
            loading={generateZip.isPending}
            onClick={() => generateZip.mutate()}
            disabled={!reurbEnabled || !hasProject}
          >
            Gerar Pacote Cartorio (ZIP)
          </Button>
        </CardContent>
        {!reurbEnabled && (
          <CardDescription className="px-6 pb-6 text-xs text-on-surface-muted">
            REURB esta desabilitado. Ative o modulo para liberar as geracoes.
          </CardDescription>
        )}
        {reurbEnabled && !hasProject && (
          <CardDescription className="px-6 pb-6 text-xs text-on-surface-muted">
            Selecione um projeto para habilitar as exportacoes.
          </CardDescription>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projetos REURB</CardTitle>
          <CardDescription>Selecione um projeto ativo para trabalhar nas familias e unidades.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Nome do projeto"
              value={newProject.name}
              onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Area / bairro"
              value={newProject.area}
              onChange={(e) => setNewProject((prev) => ({ ...prev, area: e.target.value }))}
            />
            <Button loading={createProject.isPending} onClick={() => createProject.mutate()} disabled={!reurbEnabled}>
              Criar projeto
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(projectsQuery.data ?? []).map((project) => (
              <Button
                key={getId(project)}
                variant={projectIdSafe === getId(project) ? "default" : "outline"}
                onClick={() => setProjectId(getId(project))}
              >
                {project.name}
              </Button>
            ))}
            {projectsQuery.data?.length === 0 ? (
              <span className="text-sm text-on-surface-muted">Nenhum projeto cadastrado.</span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cadastro de familias beneficiarias</CardTitle>
            <CardDescription>Modelo estruturado, com status Apta/Pendente/Irregular.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Codigo da familia"
                value={newFamily.familyCode}
                onChange={(e) => setNewFamily((prev) => ({ ...prev, familyCode: e.target.value }))}
              />
              <Input
                placeholder="Nucleo"
                value={newFamily.nucleus}
                onChange={(e) => setNewFamily((prev) => ({ ...prev, nucleus: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Responsavel"
                value={newFamily.responsibleName}
                onChange={(e) => setNewFamily((prev) => ({ ...prev, responsibleName: e.target.value }))}
              />
              <Input
                placeholder="CPF"
                value={newFamily.cpf}
                onChange={(e) => setNewFamily((prev) => ({ ...prev, cpf: e.target.value }))}
              />
            </div>
            <select
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={newFamily.status}
              onChange={(event) =>
                setNewFamily((prev) => ({ ...prev, status: event.target.value as "APTA" | "PENDENTE" | "IRREGULAR" }))
              }
            >
              <option value="PENDENTE">Pendente</option>
              <option value="APTA">Apta</option>
              <option value="IRREGULAR">Irregular</option>
            </select>
            <Button
              loading={createFamily.isPending}
              onClick={() => createFamily.mutate()}
              disabled={!reurbEnabled || !hasProject}
            >
              Cadastrar familia
            </Button>
            <div className="space-y-2">
              <Input
                placeholder="CSV (familyCode,nucleus,responsibleName,cpf,address)"
                value={csvPayload}
                onChange={(e) => setCsvPayload(e.target.value)}
              />
              <Button
                variant="outline"
                loading={importFamilies.isPending}
                onClick={() => importFamilies.mutate()}
                disabled={!reurbEnabled || !hasProject}
              >
                Importar CSV
              </Button>
            </div>
            <Input placeholder="Buscar por codigo, responsavel, CPF..." value={q} onChange={(e) => setQ(e.target.value)} />
            <DataTable
              data={familiesQuery.data ?? []}
              loading={familiesQuery.isLoading}
              columns={[
                { key: "familyCode", label: "Codigo" },
                { key: "nucleus", label: "Nucleo" },
                { key: "responsibleName", label: "Responsavel" },
                { key: "status", label: "Status" },
              ]}
              emptyMessage="Nenhuma familia cadastrada."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unidades / Imoveis</CardTitle>
            <CardDescription>Base para plantas, memoriais e CRF.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Codigo da unidade"
                value={newUnit.code}
                onChange={(e) => setNewUnit((prev) => ({ ...prev, code: e.target.value }))}
              />
              <Input
                placeholder="Quadra"
                value={newUnit.block}
                onChange={(e) => setNewUnit((prev) => ({ ...prev, block: e.target.value }))}
              />
              <Input
                placeholder="Lote"
                value={newUnit.lot}
                onChange={(e) => setNewUnit((prev) => ({ ...prev, lot: e.target.value }))}
              />
              <Input
                placeholder="Endereco"
                value={newUnit.address}
                onChange={(e) => setNewUnit((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <Button
              loading={createUnit.isPending}
              onClick={() => createUnit.mutate()}
              disabled={!reurbEnabled || !hasProject}
            >
              Cadastrar unidade
            </Button>
            <DataTable
              data={unitsQuery.data ?? []}
              loading={unitsQuery.isLoading}
              columns={[
                { key: "code", label: "Codigo" },
                { key: "block", label: "Quadra" },
                { key: "lot", label: "Lote" },
                { key: "address", label: "Endereco" },
              ]}
              emptyMessage="Nenhuma unidade cadastrada."
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentos e dossie</CardTitle>
          <CardDescription>
            Tipos exigidos: familias ({configQuery.data?.documentNaming?.requiredDocumentTypes?.join(", ") || "livre"}),
            projeto ({configQuery.data?.documentNaming?.requiredProjectDocumentTypes?.join(", ") || "livre"}), unidades (
            {configQuery.data?.documentNaming?.requiredUnitDocumentTypes?.join(", ") || "livre"}).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-on-surface">Documento de familia</p>
            <select
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={docDraft.familyId}
              onChange={(event) => setDocDraft((prev) => ({ ...prev, familyId: event.target.value }))}
            >
              <option value="">Selecione uma familia</option>
              {(familiesQuery.data ?? []).map((family) => (
                <option key={getId(family)} value={getId(family)}>
                  {family.familyCode} - {family.responsibleName}
                </option>
              ))}
            </select>
            <Input
              placeholder="Tipo de documento (ex: RG, CPF, comprovante)"
              value={docDraft.familyDocumentType}
              onChange={(event) => setDocDraft((prev) => ({ ...prev, familyDocumentType: event.target.value }))}
            />
            <input
              type="file"
              className="w-full text-sm"
              onChange={(event) => setFamilyDocFile(event.target.files?.[0] ?? null)}
            />
            <Button loading={uploadFamilyDocument.isPending} onClick={() => uploadFamilyDocument.mutate()}>
              Enviar documento
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-on-surface">Documento do projeto</p>
            <Input
              placeholder="Tipo de documento (ex: planta, memorial)"
              value={docDraft.projectDocumentType}
              onChange={(event) => setDocDraft((prev) => ({ ...prev, projectDocumentType: event.target.value }))}
            />
            <input
              type="file"
              className="w-full text-sm"
              onChange={(event) => setProjectDocFile(event.target.files?.[0] ?? null)}
            />
            <Button loading={uploadProjectDocument.isPending} onClick={() => uploadProjectDocument.mutate()}>
              Enviar documento
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-on-surface">Documento da unidade</p>
            <select
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={docDraft.unitId}
              onChange={(event) => setDocDraft((prev) => ({ ...prev, unitId: event.target.value }))}
            >
              <option value="">Selecione uma unidade</option>
              {(unitsQuery.data ?? []).map((unit) => (
                <option key={getId(unit)} value={getId(unit)}>
                  {unit.code} {unit.block ? `(${unit.block})` : ""}
                </option>
              ))}
            </select>
            <Input
              placeholder="Tipo de documento (ex: foto, memorial)"
              value={docDraft.unitDocumentType}
              onChange={(event) => setDocDraft((prev) => ({ ...prev, unitDocumentType: event.target.value }))}
            />
            <input
              type="file"
              className="w-full text-sm"
              onChange={(event) => setUnitDocFile(event.target.files?.[0] ?? null)}
            />
            <Button loading={uploadUnitDocument.isPending} onClick={() => uploadUnitDocument.mutate()}>
              Enviar documento
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dossie do projeto</CardTitle>
          <CardDescription>Status consolidado de documentos faltantes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {dossierQuery.data ? (
            <div className="space-y-2 text-sm text-on-surface-muted">
              <p>
                Projeto: {dossierQuery.data.project.name} ({dossierQuery.data.project.status}) - faltando{" "}
                {dossierQuery.data.project.missingDocuments.length} documento(s).
              </p>
              <p>
                Familias com pendencias:{" "}
                {dossierQuery.data.families.filter((item) => item.missing.length > 0).length}
              </p>
              <p>
                Unidades com pendencias:{" "}
                {dossierQuery.data.units.filter((item) => item.missing.length > 0).length}
              </p>
            </div>
          ) : (
            <p className="text-sm text-on-surface-muted">Selecione um projeto para ver o dossie.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificacoes e evidencias</CardTitle>
          <CardDescription>Templates, envios por email e anexos de comprovantes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-on-surface">Novo template</p>
              <Input
                placeholder="Nome do template"
                value={templateDraft.name}
                onChange={(event) => setTemplateDraft((prev) => ({ ...prev, name: event.target.value }))}
              />
              <Input
                placeholder="Assunto"
                value={templateDraft.subject}
                onChange={(event) => setTemplateDraft((prev) => ({ ...prev, subject: event.target.value }))}
              />
              <Input
                placeholder="Corpo (use {{variavel}})"
                value={templateDraft.body}
                onChange={(event) => setTemplateDraft((prev) => ({ ...prev, body: event.target.value }))}
              />
              <Button loading={createTemplate.isPending} onClick={() => createTemplate.mutate()}>
                Criar template
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-on-surface">Enviar email</p>
              <select
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={notificationDraft.templateId}
                onChange={(event) => setNotificationDraft((prev) => ({ ...prev, templateId: event.target.value }))}
              >
                <option value="">Selecione um template</option>
                {(templatesQuery.data ?? []).map((template) => (
                  <option key={getId(template)} value={getId(template)}>
                    {template.name} v{template.version}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Email destinatario"
                value={notificationDraft.to}
                onChange={(event) => setNotificationDraft((prev) => ({ ...prev, to: event.target.value }))}
              />
              <Input
                placeholder='Variaveis JSON (ex: {"nome":"Maria"})'
                value={notificationDraft.variablesJson}
                onChange={(event) => setNotificationDraft((prev) => ({ ...prev, variablesJson: event.target.value }))}
              />
              <Button loading={sendNotification.isPending} onClick={() => sendNotification.mutate()}>
                Enviar notificacao
              </Button>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-on-surface">Evidencia de notificacao</p>
              <select
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={evidenceDraft.notificationId}
                onChange={(event) => setEvidenceDraft({ notificationId: event.target.value })}
              >
                <option value="">Selecione uma notificacao</option>
                {(notificationsQuery.data ?? []).map((notification) => (
                  <option key={getId(notification)} value={getId(notification)}>
                    {notification.templateName} - {notification.to}
                  </option>
                ))}
              </select>
              <input
                type="file"
                className="w-full text-sm"
                onChange={(event) => setEvidenceFile(event.target.files?.[0] ?? null)}
              />
              <Button loading={uploadEvidence.isPending} onClick={() => uploadEvidence.mutate()}>
                Anexar evidencia
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-on-surface">Historico de notificacoes</p>
              <DataTable
                data={notificationsQuery.data ?? []}
                loading={notificationsQuery.isLoading}
                columns={[
                  { key: "templateName", label: "Template" },
                  { key: "to", label: "Destino" },
                  { key: "status", label: "Status" },
                  { key: "sentAt", label: "Enviado em" },
                ]}
                emptyMessage="Nenhuma notificacao enviada."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pendencias documentais</CardTitle>
          <CardDescription>Controle por nucleo/familia com trilha de status.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={pendenciesQuery.data ?? []}
            loading={pendenciesQuery.isLoading}
            columns={[
              { key: "nucleus", label: "Nucleo" },
              { key: "documentType", label: "Tipo" },
              { key: "missingDocument", label: "Documento faltante" },
              { key: "responsible", label: "Responsavel" },
              { key: "status", label: "Status" },
            ]}
            emptyMessage="Nenhuma pendencia cadastrada."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historico de entregaveis</CardTitle>
          <CardDescription>
            Template: {configQuery.data?.spreadsheet?.templateVersion ?? "v1"}. Colunas: {columnsText || "padrao"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={deliverablesQuery.data ?? []}
            loading={deliverablesQuery.isLoading}
            columns={[
              { key: "kind", label: "Tipo" },
              { key: "version", label: "Versao" },
              { key: "fileName", label: "Arquivo" },
              { key: "generatedAt", label: "Gerado em" },
              { key: "hashSha256", label: "Hash" },
            ]}
            emptyMessage="Nenhum entregavel gerado ainda."
          />
        </CardContent>
      </Card>
    </div>
  );
}
