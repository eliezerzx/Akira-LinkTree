import { StarLinkButton } from "./components/StarLinkButton";
import { SmokeBackground } from "./components/SmokeBackground";

const links = [
  {
    href: "https://www.twitch.tv/akira_02777",
    iconSrc: "/images/logos/Twitch.png",
    title: "Twitch",
    subtitle: "Assista a live agora",
  },
  {
    href: "https://kick.com/akira-027",
    iconSrc: "/images/logos/Kick.jpg",
    title: "Kick",
    subtitle: "Live tambem no Kick",
  },
  {
    href: "https://youtube.com/@SEU_CANAL",
    iconSrc: "/images/logos/Youtube.png",
    title: "YouTube",
    subtitle: "Inscreva-se no canal",
  },
  {
    href: "https://instagram.com/SEU_USUARIO",
    iconSrc: "/images/logos/Instagram.svg",
    title: "Instagram",
    subtitle: "Bastidores e novidades",
  },
  {
    href: "https://tiktok.com/@SEU_USUARIO",
    iconSrc: "/images/logos/TikTok.png",
    title: "TikTok",
    subtitle: "Clipes e momentos",
  },
  {
    href: "https://discord.gg/SEU_SERVIDOR",
    iconSrc: "/images/logos/Discord.png",
    title: "Discord",
    subtitle: "Entre pra comunidade",
  },
];

function App() {
  return (
    <>
      <SmokeBackground smokeColor="#8b5cf6" />
      <main className="page">
        <section className="card">
          <img className="avatar" src="/images/Profile.jpg" alt="Foto de perfil de Akira" />
          <h1 className="name">AKIRA</h1>
          <p className="bio">"Uma live de cada vez.. Um passo de cada vez." 💜</p>

          <nav className="links">
            {links.map((link) => (
              <StarLinkButton key={link.title} href={link.href} label={link.title} />
            ))}
          </nav>
        </section>

        <footer className="footer">
          <p>© {new Date().getFullYear()} Akira</p>
          <p>
            <a href="/privacidade.html" className="footer-link">
              Politica de Privacidade
            </a>
          </p>
          <p className="footer-credit">
            Criado por{" "}
            <a
              href="https://instagram.com/singularitypages"
              target="_blank"
              rel="noopener"
              className="footer-credit-link"
            >
              SingularityPages
            </a>
          </p>
        </footer>
      </main>
    </>
  );
}

export default App;
