import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";

const sections = [
  { id: "introduccion", title: "1. Introducción" },
  { id: "datos", title: "2. Datos recopilados" },
  { id: "uso", title: "3. Uso de los datos" },
  { id: "comparticion", title: "4. Compartición de datos" },
  { id: "seguridad", title: "5. Almacenamiento y seguridad" },
  { id: "retencion", title: "6. Retención de datos" },
  { id: "derechos", title: "7. Derechos del usuario" },
  { id: "terceros", title: "8. Servicios de terceros" },
  { id: "menores", title: "9. Menores de edad" },
  { id: "cambios", title: "10. Cambios en la política" },
  { id: "contacto", title: "11. Contacto" },
];

export default function PrivacyPolicy() {
  const lastUpdated = "24/09/2025"; // actualizar cuando corresponda

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">🔒 Política de Privacidad – Jujuy Conecta</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Última actualización: <time dateTime="2025-09-24">{lastUpdated}</time>
          </p>
        </header>

        {/* Índice */}
        <nav aria-label="Índice" className="mb-8 border rounded-lg p-4">
          <p className="font-medium mb-2">Contenido</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a className="hover:underline" href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <section id="introduccion">
            <h2>1. Introducción</h2>
            <p>
              En Jujuy Conecta respetamos tu privacidad. Esta Política explica qué datos recopilamos, cómo los usamos y cuáles
              son tus derechos al utilizar la aplicación.
            </p>
          </section>

          <section id="datos">
            <h2>2. Datos recopilados</h2>
            <p>Para el funcionamiento de la app solicitamos únicamente:</p>
            <ul>
              <li>
                <strong>Correo electrónico asociado a tu cuenta de Google:</strong> se utiliza para autenticar tu identidad y crear tu
                perfil en la aplicación.
              </li>
              <li>
                <strong>Información técnica mínima:</strong> datos de uso básicos (fecha de acceso, consultas realizadas de manera
                anónima, estadísticas) con fines de mejora del servicio.
              </li>
            </ul>
            <p className="mt-3">
              <strong>👉 No accedemos</strong> a tus correos electrónicos, contactos, archivos ni a información privada de tu cuenta de Google.
            </p>
          </section>

          <section id="uso">
            <h2>3. Uso de los datos</h2>
            <p>Los datos recopilados se utilizan para:</p>
            <ul>
              <li>Permitir el inicio de sesión seguro.</li>
              <li>Personalizar tu experiencia en la app.</li>
              <li>Mejorar el servicio a partir de métricas de uso generales.</li>
              <li>Contactarte únicamente si es necesario por soporte o incidencias.</li>
            </ul>
          </section>

          <section id="comparticion">
            <h2>4. Compartición de datos</h2>
            <ul>
              <li>No vendemos, alquilamos ni compartimos tus datos personales con terceros.</li>
              <li>Solo podrán compartirse en caso de obligación legal (ejemplo: requerimiento judicial).</li>
            </ul>
          </section>

          <section id="seguridad">
            <h2>5. Almacenamiento y seguridad</h2>
            <ul>
              <li>Los datos se almacenan en servidores seguros de proveedores de confianza.</li>
              <li>Implementamos medidas técnicas y organizativas para proteger la información frente a accesos no autorizados.</li>
              <li>
                En caso de incidente de seguridad, notificaremos al usuario y a las autoridades competentes según lo exija la ley.
              </li>
            </ul>
          </section>

          <section id="retencion">
            <h2>6. Retención de datos</h2>
            <ul>
              <li>Conservamos tus datos mientras tengas una cuenta activa en Jujuy Conecta.</li>
              <li>Si solicitás la eliminación, tu información será borrada de manera definitiva en un plazo máximo de 30 días.</li>
            </ul>
          </section>

          <section id="derechos">
            <h2>7. Derechos del usuario</h2>
            <p>Tenés derecho a:</p>
            <ul>
              <li>Acceder a tus datos personales.</li>
              <li>Rectificarlos si son incorrectos.</li>
              <li>Solicitar la eliminación de tu cuenta y datos.</li>
              <li>Limitar u oponerte al tratamiento de tus datos.</li>
            </ul>
            <p>
              Para ejercer estos derechos, podés escribir a{" "}
              <a href="mailto:jujuyconecta@gmail.com">jujuyconecta@gmail.com</a>.
            </p>
          </section>

          <section id="terceros">
            <h2>8. Servicios de terceros</h2>
            <p>
              El inicio de sesión se realiza mediante Google Identity Services (OAuth 2.0). La política de privacidad de Google se puede
              consultar en{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://policies.google.com/privacy
              </a>.
            </p>
          </section>

          <section id="menores">
            <h2>9. Menores de edad</h2>
            <p>
              El servicio está destinado a usuarios mayores de 13 años. Si un menor accede sin autorización, el tutor o responsable
              puede solicitar la eliminación inmediata de los datos asociados.
            </p>
          </section>

          <section id="cambios">
            <h2>10. Cambios en la política</h2>
            <p>
              Podremos actualizar esta Política de Privacidad. Notificaremos cambios relevantes en la aplicación o sitio web.
            </p>
          </section>

          <section id="contacto">
            <h2>11. Contacto</h2>
            <p>
              Para consultas sobre privacidad o protección de datos, escribinos a:{" "}
              <a href="mailto:jujuyconecta@gmail.com">jujuyconecta@gmail.com</a>
            </p>
          </section>
        </article>

        <footer className="mt-10 text-sm text-muted-foreground">
          <p>
            ¿Buscás los <Link className="underline" to="/terminos">Términos y Condiciones</Link>?
          </p>
        </footer>
      </div>
    </Layout>
  );
}
