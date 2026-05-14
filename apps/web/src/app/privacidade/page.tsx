export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-sm text-slate-700 leading-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Política de Privacidade</h1>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">1. Dados Coletados</h2>
        <p>Coletamos os seguintes dados pessoais fornecidos voluntariamente pelo cidadão:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li><strong>Nome</strong> — identificação do solicitante</li>
          <li><strong>Contato</strong> — telefone ou e-mail para resposta</li>
          <li><strong>Endereço</strong> — localização da solicitação (opcional)</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">2. Finalidade do Tratamento</h2>
        <p>Os dados são tratados exclusivamente para:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Registro e acompanhamento de solicitações do cidadão (art. 7 LGPD)</li>
          <li>Comunicação sobre o andamento do chamado</li>
          <li>Cumprimento de obrigações legais municipais</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">3. Compartilhamento</h2>
        <p>Os dados não são compartilhados com terceiros fora do âmbito da administração municipal responsável pelo atendimento.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">4. Direitos do Titular (art. 18 LGPD)</h2>
        <p>Você tem direito a:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Solicitar a exclusão dos seus dados (direito ao esquecimento)</li>
          <li>Solicitar a correção de dados incorretos</li>
          <li>Solicitar a portabilidade dos dados</li>
          <li>Revogar o consentimento a qualquer momento</li>
        </ul>
        <p className="mt-2">Para exercer seus direitos, entre em contato pelo e-mail: <a href="mailto:lgpd@flydea.com.br" className="text-teal-700 underline">lgpd@flydea.com.br</a></p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">5. Armazenamento</h2>
        <p>Os dados são armazenados em servidores seguros com criptografia. O período de retenção segue a legislação municipal aplicável.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">6. Encarregado de Dados (DPO)</h2>
        <p>Contato do Encarregado de Dados: <a href="mailto:dpo@flydea.com.br" className="text-teal-700 underline">dpo@flydea.com.br</a></p>
      </section>

      <footer className="text-xs text-slate-400 border-t pt-6 mt-8">
        <p>FlyDea GovTech — Versão 1.0 — Maio 2026</p>
      </footer>
    </main>
  );
}
