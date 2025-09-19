import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../src/App";

// 🔧 Backend fetch'ni mock qilamiz
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        strike: 123.45,
        dip: 45.67,
        dip_direction: 200.12,
        created_at: new Date().toISOString(),
      }),
  })
);

describe("📊 App Component", () => {
  test("Form inputlari to‘g‘ri render bo‘ladi", () => {
    render(<App />);
    expect(screen.getByText(/3 Nuqta Hisoblash/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("X")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Y")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Z")).toBeInTheDocument();
  });

  test("Xatolik chiqadi agar inputlar bo‘sh bo‘lsa", async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Hisoblash/i));
    expect(await screen.findByText(/Barcha nuqtalar to‘ldirilishi shart!/i)).toBeInTheDocument();
  });

  test("Natija paneli chiqadi agar fetch muvaffaqiyatli bo‘lsa", async () => {
    render(<App />);

    const inputs = screen.getAllByRole("spinbutton");
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: (index + 1) * 10 } });
    });

    fireEvent.click(screen.getByText(/Hisoblash/i));

    await waitFor(() => {
      expect(screen.getByText(/Hisob Natijasi/i)).toBeInTheDocument();
      expect(screen.getByText(/123.45°/i)).toBeInTheDocument();
      expect(screen.getByText(/45.67°/i)).toBeInTheDocument();
    });
  });
});

test("Oxirgi 5 hisob saqlanadi", async () => {
  render(<App />);
  const inputs = screen.getAllByRole("spinbutton");

  for (let i = 0; i < 6; i++) {
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: (index + 1) * 10 + i } });
    });
    fireEvent.click(screen.getByText(/Hisoblash/i));
    await waitFor(() => {
      expect(screen.getByText(/Hisob Natijasi/i)).toBeInTheDocument();
    });
  }

  const historyItems = screen.getAllByText(/Strike/);
  expect(historyItems.length).toBe(5); // faqat oxirgi 5 ta qolishi kerak
});
