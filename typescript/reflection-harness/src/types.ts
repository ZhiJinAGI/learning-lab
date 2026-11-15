export type Login = () => void | Promise<void>;
export type ShowToast = (message: string) => void;

export interface Candidate {
  source: string;
  handleLogin: (login: Login, showToast: ShowToast) => void | Promise<void>;
}

export interface Evaluation {
  passed: boolean;
  feedback: string;
}

export interface LanguageModel {
  generate(task: string, memories: readonly string[]): Promise<Candidate>;
  reflect(
    task: string,
    candidate: Candidate,
    evaluation: Evaluation,
  ): Promise<string>;
}
