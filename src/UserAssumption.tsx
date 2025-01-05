interface UserAssumptionProps {
  heading: number;
}

export const UserAssumption: React.FC<UserAssumptionProps> = () => {
  return (
    <div className="user-assumption-container">
      <p className="user-assumption-text">
        Assume you are direct to the fix on the heading indicated by the heading
        indicator.
      </p>
    </div>
  );
};
