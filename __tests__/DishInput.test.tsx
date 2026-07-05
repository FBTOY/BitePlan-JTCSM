import { render, screen, fireEvent } from "@testing-library/react";
import DishInput from "@/components/DishInput";

describe("DishInput", () => {
  it("submits dish name and extra notes", () => {
    const onSubmit = jest.fn();
    render(<DishInput onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText("例如：番茄炒蛋、红烧肉、奶油蘑菇汤"), {
      target: { value: "番茄炒蛋" },
    });
    fireEvent.change(
      screen.getByPlaceholderText("例如：想要清淡一点、只有电磁炉、希望少洗碗……"),
      { target: { value: "少油" } }
    );
    fireEvent.click(screen.getByRole("button", { name: /生成烹饪方案/ }));

    expect(onSubmit).toHaveBeenCalledWith("番茄炒蛋", "少油");
  });

  it("does not submit when dish name is empty", () => {
    const onSubmit = jest.fn();
    render(<DishInput onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: /生成烹饪方案/ }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
