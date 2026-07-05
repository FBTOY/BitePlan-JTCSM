import { render, screen, fireEvent } from "@testing-library/react";
import PantryManager from "@/components/PantryManager";

const sampleItems = [
  {
    id: "1",
    name: "葱",
    category: "ingredient" as const,
    updatedAt: "2026-01-01",
  },
  {
    id: "2",
    name: "生抽",
    category: "seasoning" as const,
    updatedAt: "2026-01-01",
  },
];

describe("PantryManager", () => {
  it("adds a new ingredient item", () => {
    const onChange = jest.fn();
    render(<PantryManager items={[]} onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText("例如：土豆、鸡蛋、牛肉"), {
      target: { value: "生抽" },
    });
    fireEvent.change(screen.getByPlaceholderText("数量（可选）"), {
      target: { value: "1瓶" },
    });
    fireEvent.click(screen.getByRole("button", { name: /添加食材/ }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const items = onChange.mock.calls[0][0];
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe("生抽");
    expect(items[0].quantity).toBe("1瓶");
    expect(items[0].category).toBe("ingredient");
  });

  it("switches category and adds seasoning", () => {
    const onChange = jest.fn();
    render(<PantryManager items={[]} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /配料\/调料/ }));

    fireEvent.change(screen.getByPlaceholderText("例如：生抽、蚝油、花椒"), {
      target: { value: "蚝油" },
    });
    fireEvent.click(screen.getByRole("button", { name: /添加配料\/调料/ }));

    const items = onChange.mock.calls[0][0];
    expect(items[0].category).toBe("seasoning");
  });

  it("removes an item", () => {
    const onChange = jest.fn();
    render(<PantryManager items={sampleItems} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /删除 葱/ }));
    expect(onChange).toHaveBeenCalledWith([sampleItems[1]]);
  });

  it("filters items by search", () => {
    const onChange = jest.fn();
    render(<PantryManager items={sampleItems} onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText("搜索"), {
      target: { value: "葱" },
    });

    expect(screen.queryByText("生抽")).not.toBeInTheDocument();
    expect(screen.getByText("葱")).toBeInTheDocument();
  });
});
