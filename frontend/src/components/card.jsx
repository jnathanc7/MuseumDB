export function Card({ children }) {
    return <div className="border rounded-lg p-4 shadow">{children}</div>;
  }
  
  export function CardContent({ children }) {
    return <div>{children}</div>;
  }
  