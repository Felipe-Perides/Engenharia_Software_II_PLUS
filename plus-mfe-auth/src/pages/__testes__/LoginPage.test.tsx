import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../LoginPage";
import * as authClient from "../../api/authClient";

vi.mock("../../api/authClient", () => ({
  login: vi.fn(),
}));

const mockedLogin = vi.mocked(authClient.login);

describe("LoginPage", () => {
  beforeEach(() => {
    mockedLogin.mockReset();
  });

  describe("renderização", () => {
    it("renderiza título, campos e botão", () => {
      render(<LoginPage />);
      expect(
        screen.getByRole("heading", { name: /Plus.*Entrar/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /entrar/i })
      ).toBeInTheDocument();
    });

    it("foca o campo de e-mail ao montar", () => {
      render(<LoginPage />);
      expect(screen.getByLabelText(/e-mail/i)).toHaveFocus();
    });
  });

  describe("validação de campos", () => {
    it("mostra erro quando e-mail está vazio ao submeter", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.click(screen.getByRole("button", { name: /entrar/i }));

      expect(
        screen.getByText(/e-mail é obrigatório/i)
      ).toBeInTheDocument();
    });

    it("mostra erro quando e-mail é inválido", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText(/e-mail/i), "naoehemail");
      await user.type(screen.getByLabelText(/senha/i), "senha123");
      await user.click(screen.getByRole("button", { name: /entrar/i }));

      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
    });

    it("mostra erro quando senha é muito curta", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText(/e-mail/i), "teste@teste.com");
      await user.type(screen.getByLabelText(/senha/i), "12");
      await user.click(screen.getByRole("button", { name: /entrar/i }));

      expect(screen.getByText(/senha muito curta/i)).toBeInTheDocument();
    });

    it("não chama login se a validação falhar", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.click(screen.getByRole("button", { name: /entrar/i }));

      expect(mockedLogin).not.toHaveBeenCalled();
    });
  });

  describe("submissão bem-sucedida", () => {
    it("chama authClient.login com e-mail e senha", async () => {
      mockedLogin.mockResolvedValueOnce({ token: "t", refresh: "r" });
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText(/e-mail/i), "teste@teste.com");
      await user.type(screen.getByLabelText(/senha/i), "senha123");
      await user.click(screen.getByRole("button", { name: /entrar/i }));

      expect(mockedLogin).toHaveBeenCalledWith({
        email: "teste@teste.com",
        password: "senha123",
      });
    });

    it("chama o callback onLogin com a resposta do MS", async () => {
      const data = { token: "abc", refresh: "xyz" };
      mockedLogin.mockResolvedValueOnce(data);
      const onLogin = vi.fn();
      const user = userEvent.setup();
      render(<LoginPage onLogin={onLogin} />);

      await user.type(screen.getByLabelText(/e-mail/i), "teste@teste.com");
      await user.type(screen.getByLabelText(/senha/i), "senha123");
      await user.click(screen.getByRole("button", { name: /entrar/i }));

      expect(onLogin).toHaveBeenCalledWith(data);
    });
  });

  describe("erros de submissão", () => {
    it("exibe mensagem de erro quando o login falha", async () => {
      mockedLogin.mockRejectedValueOnce(new Error("Credenciais inválidas"));
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText(/e-mail/i), "teste@teste.com");
      await user.type(screen.getByLabelText(/senha/i), "senha-errada");
      await user.click(screen.getByRole("button", { name: /entrar/i }));

      expect(
        await screen.findByText(/credenciais inválidas/i)
      ).toBeInTheDocument();
    });

    it("não chama onLogin quando o login falha", async () => {
      mockedLogin.mockRejectedValueOnce(new Error("Erro genérico"));
      const onLogin = vi.fn();
      const user = userEvent.setup();
      render(<LoginPage onLogin={onLogin} />);

      await user.type(screen.getByLabelText(/e-mail/i), "teste@teste.com");
      await user.type(screen.getByLabelText(/senha/i), "senha123");
      await user.click(screen.getByRole("button", { name: /entrar/i }));

      await screen.findByText(/erro genérico/i);
      expect(onLogin).not.toHaveBeenCalled();
    });
  });
});
