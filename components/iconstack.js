export default function IconStack({ children }){
  return(
    <div className="rounded-md shadow-lg columns-3  lg:columns-4 lg:pl-0 lg:pr-0 border-black border-1">
      {children}
    </div>
  );
}