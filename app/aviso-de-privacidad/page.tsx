import type { Metadata } from "next";
import { siteContent } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "Aviso de privacidad | Atelier Floral",
  description: "Aviso de privacidad de Atelier Floral para solicitudes de cotización y contacto.",
};

const lastUpdated = "11 de junio de 2026";

export default function PrivacyNoticePage() {
  return (
    <main className="container-page section-pad">
      <article className="mx-auto max-w-4xl rounded-[2rem] border border-white/70 bg-white/70 p-6 leading-8 text-coffee shadow-card sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-sage">Legal</p>
        <h1 className="mt-3 font-heading text-5xl text-ink">Aviso de privacidad</h1>
        <p className="mt-4 text-sm font-semibold text-coffee">Última actualización: {lastUpdated}</p>

        <section className="mt-8 space-y-4">
          <h2 className="font-heading text-3xl text-ink">Responsable del tratamiento</h2>
          <p>
            Atelier Floral, operado por una persona física, es responsable del tratamiento de los datos personales que recaba a través de este sitio web. Para efectos de privacidad y ejercicio de derechos ARCO, el medio de contacto es {" "}
            <a href={`mailto:${siteContent.privacyEmail}`} className="font-semibold text-ink underline underline-offset-4">
              {siteContent.privacyEmail}
            </a>
            .
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-heading text-3xl text-ink">Datos personales que recabamos</h2>
          <p>Podemos recabar los siguientes datos cuando solicitas una cotización o te pones en contacto con nosotros:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Nombre.</li>
            <li>Teléfono.</li>
            <li>Correo electrónico, cuando decidas proporcionarlo.</li>
            <li>Usuario de Instagram, cuando decidas proporcionarlo.</li>
            <li>Tipo y fecha de evento, notas de personalización y productos de interés.</li>
          </ul>
          <p>No solicitamos datos personales sensibles.</p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-heading text-3xl text-ink">Finalidades del tratamiento</h2>
          <p>Usamos tus datos personales para las siguientes finalidades primarias:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Recibir, registrar y dar seguimiento a solicitudes de cotización.</li>
            <li>Contactarte por WhatsApp, teléfono, correo electrónico o Instagram para responder tu solicitud.</li>
            <li>Preparar propuestas de productos personalizados, disponibilidad, precios y tiempos de entrega.</li>
            <li>Mantener un historial operativo de cotizaciones para atención y control interno.</li>
          </ul>
          <p>No usaremos tus datos para finalidades secundarias de mercadotecnia masiva sin solicitar tu consentimiento adicional.</p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-heading text-3xl text-ink">Transferencias y encargados</h2>
          <p>
            Al enviar una cotización, la información se almacena en Supabase como proveedor tecnológico de base de datos. Cuando eliges continuar por WhatsApp, se abre una conversación con WhatsApp/Meta y los datos incluidos en el mensaje quedan sujetos también a sus propios términos y políticas de privacidad.
          </p>
          <p>No vendemos ni rentamos tus datos personales.</p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-heading text-3xl text-ink">Conservación de datos</h2>
          <p>
            Conservamos las solicitudes de cotización durante un plazo máximo de 12 meses para seguimiento comercial y control administrativo. Después de ese plazo, los datos personales de la solicitud se anonimizarán o eliminarán, salvo que exista una obligación legal o relación contractual que requiera conservarlos por más tiempo.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-heading text-3xl text-ink">Derechos ARCO y revocación del consentimiento</h2>
          <p>
            Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación u Oposición, así como revocar tu consentimiento o limitar el uso o divulgación de tus datos personales, enviando una solicitud al correo {" "}
            <a href={`mailto:${siteContent.privacyEmail}`} className="font-semibold text-ink underline underline-offset-4">
              {siteContent.privacyEmail}
            </a>
            .
          </p>
          <p>Tu solicitud deberá incluir nombre, medio de contacto, derecho que deseas ejercer, descripción clara de tu petición y documentos que acrediten tu identidad o representación legal, cuando corresponda.</p>
          <p>Responderemos en un plazo máximo de 20 días hábiles contados desde la recepción de la solicitud completa. Si resulta procedente, se hará efectiva dentro de los 15 días hábiles siguientes, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.</p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-heading text-3xl text-ink">Medidas de seguridad</h2>
          <p>
            Implementamos medidas administrativas, técnicas y organizativas razonables para proteger tus datos personales contra daño, pérdida, alteración, destrucción, uso, acceso o tratamiento no autorizado. Estas medidas incluyen controles de acceso, validación de formularios, protección de sesiones administrativas, limitación de tasa de solicitudes y políticas de acceso en la base de datos.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-heading text-3xl text-ink">Cookies y almacenamiento local</h2>
          <p>
            Este sitio no utiliza herramientas de analítica o publicidad de terceros. Puede usar almacenamiento local del navegador para conservar temporalmente los productos de tu cotización y cookies técnicas necesarias para operar el panel administrativo. Estas tecnologías no se usan para publicidad comportamental.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-heading text-3xl text-ink">Cambios al aviso</h2>
          <p>
            Podemos actualizar este aviso de privacidad para reflejar cambios legales, técnicos u operativos. La versión vigente estará disponible permanentemente en esta página.
          </p>
        </section>
      </article>
    </main>
  );
}
