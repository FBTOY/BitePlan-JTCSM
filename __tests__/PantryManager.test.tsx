import { render, screen, fireEvent } from "@testing-library/react";
import PantryManager from "@/components/PantryManager";

describe("PantryManager", () => {
  it("adds a new pantry item", () => {
    const onChange = jest.fn();
    render(<PantryManager items={[]} onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText("名称，例如：生抽"), {
      target: { value: "生抽" },
    });
    fireEvent.change(screen.getByPlaceholderText("数量（可选）"), {
      target: { value: "1瓶" },
    });
    fireEvent.click(screen.getByRole("button", { name: /添加/ }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const items = onChange.mock.calls[0][0];
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe("生抽");
    expect(items[0].quantity).toBe("1瓶");
  });

  it("removes an item", () => {
    const onChange = jest.fn();
    const items = [
      {
        id: "1",
        name: "葱",
        category: "ingredient" as const,
        updatedAt: "2026-01-01",
      },
    ];
    render(<PantryManager items={items} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
