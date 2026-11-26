import { fireEvent, render, screen } from "@testing-library/react";
import { OrderArrivalNotice } from "@/components/dashboard/OrderArrivalNotice";
import { useStaffOrders } from "@/hooks/use-staff-orders";

jest.mock("@/hooks/use-staff-orders", () => ({ useStaffOrders: jest.fn() }));

const placed = (id, label) => ({ _id: id, status: "placed", table: { label } });

test("establishes a baseline and announces each newly placed order once across dashboard navigation", () => {
    const backlog = placed("existing", "Table 1");
    const incoming = placed("new", "Table 2");
    useStaffOrders.mockReturnValue({ data: undefined });
    const { rerender } = render(<OrderArrivalNotice onBoard={false} />);
    useStaffOrders.mockReturnValue({ data: { orders: [backlog] } });
    rerender(<OrderArrivalNotice onBoard={false} />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();

    useStaffOrders.mockReturnValue({ data: { orders: [backlog, incoming] } });
    rerender(<OrderArrivalNotice onBoard={false} />);
    expect(screen.getByRole("status")).toHaveTextContent("New order · Table 2");
    expect(screen.getByRole("link", { name: "View orders" })).toHaveAttribute("href", "/dashboard/orders");
    rerender(<OrderArrivalNotice onBoard />);
    fireEvent.click(screen.getByRole("button", { name: "Dismiss new order notice" }));
    useStaffOrders.mockReturnValue({ data: { orders: [{ ...incoming, status: "preparing" }] } });
    rerender(<OrderArrivalNotice onBoard />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
});

test("groups arrivals in one polling interval and ignores a failed read", () => {
    useStaffOrders.mockReturnValue({ data: { orders: [] } });
    const { rerender } = render(<OrderArrivalNotice onBoard />);
    useStaffOrders.mockReturnValue({ data: undefined, error: new Error("offline") });
    rerender(<OrderArrivalNotice onBoard />);
    useStaffOrders.mockReturnValue({ data: { orders: [placed("a", "Table 1"), placed("b", "Table 2")] } });
    rerender(<OrderArrivalNotice onBoard />);
    expect(screen.getByRole("status")).toHaveTextContent("2 new orders");
});
