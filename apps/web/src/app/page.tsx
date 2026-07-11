"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bell,
  Boxes,
  ClipboardCheck,
  FileSpreadsheet,
  Fuel,
  HardDrive,
  LayoutDashboard,
  Menu,
  PackageCheck,
  Search,
  ShieldCheck,
  Ticket,
  Users,
  Wrench,
} from "lucide-react";

type AuthUser = {
  id: string;
  email: string;
  username: string;
  fullName: string;
  status: string;
  role: {
    id: string;
    code: string;
    name: string;
  };
};

type Device = {
  id: string;
  deviceCode: string;
  serialNumber: string;
  model: string | null;
  description: string | null;
  status: string;
  warehouseId: string;
  warehouseName: string;
  deviceTypeId: string;
  deviceTypeName: string;
  brandId: string;
  brandName: string;
  currentResponsibleName: string | null;
  departmentId: string | null;
  departmentName: string | null;
};

type CatalogItem = {
  id: string;
  name: string;
  code?: string;
};

type WarehouseItem = CatalogItem & {
  branch?: {
    id: string;
    name: string;
    code: string;
  };
};

type DeviceFormState = {
  warehouseId: string;
  deviceTypeId: string;
  brandId: string;
  departmentId: string;
  serialNumber: string;
  model: string;
  currentResponsibleName: string;
  description: string;
  status: string;
};

type ApiListResponse<T> = T[] | { data: T[] };
type ApiEntityResponse<T> = T | { data: T };
type ModuleName =
  | "Tablero"
  | "Inventario"
  | "Mantenimientos"
  | "Consumibles"
  | "Entregas"
  | "Tickets"
  | "Usuarios"
  | "Reglas";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:3011";

const modules = [
  { name: "Inventario", detail: "Dispositivos, QR, responsables", icon: HardDrive, status: "Activo" },
  { name: "Consumibles", detail: "Stock central y movimientos", icon: Boxes, status: "Activo" },
  { name: "Entregas", detail: "Firmas, politicas y documentos", icon: PackageCheck, status: "Base lista" },
  { name: "Tickets", detail: "Help Desk WMS y evidencias", icon: Ticket, status: "Pendiente" },
  { name: "Mantenimientos", detail: "Historial por dispositivo", icon: Wrench, status: "Base lista" },
  { name: "Gasolina", detail: "Cargas, folios y tickets", icon: Fuel, status: "Pendiente" },
  { name: "Checklist", detail: "Rondines y tareas programadas", icon: ClipboardCheck, status: "Pendiente" },
  { name: "Reportes", detail: "Excel, PDF, Word y formatos", icon: FileSpreadsheet, status: "Pendiente" },
];

const consumables = [
  { code: "LBL-4X6", name: "Etiqueta 4x6", unit: "Rollo", stock: 42, min: 20, status: "OK" },
  { code: "RBN-ZB", name: "Ribbon Zebra", unit: "Pieza", stock: 12, min: 15, status: "Bajo" },
  { code: "TON-217A", name: "Toner HP CF217A", unit: "Pieza", stock: 5, min: 4, status: "OK" },
];

const navItems = [
  { name: "Tablero", icon: LayoutDashboard },
  { name: "Inventario", icon: HardDrive },
  { name: "Mantenimientos", icon: Wrench },
  { name: "Consumibles", icon: Boxes },
  { name: "Entregas", icon: PackageCheck },
  { name: "Tickets", icon: Ticket },
  { name: "Usuarios", icon: Users },
  { name: "Reglas", icon: ShieldCheck },
] satisfies { name: ModuleName; icon: typeof LayoutDashboard }[];

const emptyDeviceForm: DeviceFormState = {
  warehouseId: "",
  deviceTypeId: "",
  brandId: "",
  departmentId: "",
  serialNumber: "",
  model: "",
  currentResponsibleName: "",
  description: "",
  status: "AVAILABLE",
};

export default function Home() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<CatalogItem[]>([]);
  const [brands, setBrands] = useState<CatalogItem[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [departments, setDepartments] = useState<CatalogItem[]>([]);
  const [deviceSearch, setDeviceSearch] = useState("");
  const [deviceForm, setDeviceForm] = useState<DeviceFormState>(emptyDeviceForm);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [isSavingDevice, setIsSavingDevice] = useState(false);
  const [deviceMessage, setDeviceMessage] = useState<string | null>(null);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleName>("Tablero");

  const roleLabel = useMemo(() => {
    if (!user) {
      return "Sin sesion";
    }

    return `${user.role.name} local`;
  }, [user]);

  async function apiFetch<T>(path: string, options: RequestInit = {}, authToken = token) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.message ?? "No se pudo completar la operacion");
    }

    return payload as T;
  }

  async function loadInventoryData(authToken = token, search = deviceSearch) {
    if (!authToken) {
      return;
    }

    setIsLoadingDevices(true);
    setDeviceError(null);

    try {
      const query = search.trim()
        ? `/devices?search=${encodeURIComponent(search.trim())}`
        : "/devices";
      const [devicesPayload, deviceTypesData, brandsData, warehousesData, departmentsData] =
        await Promise.all([
          apiFetch<ApiListResponse<Device>>(query, {}, authToken),
          apiFetch<CatalogItem[]>("/device-types", {}, authToken),
          apiFetch<CatalogItem[]>("/brands", {}, authToken),
          apiFetch<WarehouseItem[]>("/warehouses", {}, authToken),
          apiFetch<CatalogItem[]>("/departments", {}, authToken),
        ]);

      setDevices(Array.isArray(devicesPayload) ? devicesPayload : devicesPayload.data);
      setDeviceTypes(deviceTypesData);
      setBrands(brandsData);
      setWarehouses(warehousesData);
      setDepartments(departmentsData);
      const intakeWarehouse =
        warehousesData.find((warehouse) => warehouse.code === "ALMACEN_IT") ??
        warehousesData[0];
      setDeviceForm((current) => ({
        ...current,
        warehouseId: current.warehouseId || intakeWarehouse?.id || "",
        deviceTypeId: current.deviceTypeId || deviceTypesData[0]?.id || "",
        brandId: current.brandId || brandsData[0]?.id || "",
      }));
    } catch (error) {
      setDeviceError(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el inventario.",
      );
    } finally {
      setIsLoadingDevices(false);
    }
  }

  useEffect(() => {
    const savedToken = window.localStorage.getItem("inventario_it_token");
    const savedUser = window.localStorage.getItem("inventario_it_user");

    if (!savedToken || !savedUser) {
      setIsCheckingSession(false);
      return;
    }

    setToken(savedToken);
    setUser(JSON.parse(savedUser) as AuthUser);

    fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${savedToken}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Sesion expirada");
        }

        return loadInventoryData(savedToken, "");
      })
      .catch(() => {
        window.localStorage.removeItem("inventario_it_token");
        window.localStorage.removeItem("inventario_it_user");
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setIsCheckingSession(false);
      });
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? "No se pudo iniciar sesion");
      }

      window.localStorage.setItem("inventario_it_token", payload.accessToken);
      window.localStorage.setItem("inventario_it_user", JSON.stringify(payload.user));
      setToken(payload.accessToken);
      setUser(payload.user);
      setPassword("");
      await loadInventoryData(payload.accessToken, "");
    } catch (error) {
      setLoginError(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesion. Revisa el API local.",
      );
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleLogout() {
    window.localStorage.removeItem("inventario_it_token");
    window.localStorage.removeItem("inventario_it_user");
    setToken(null);
    setUser(null);
    setDevices([]);
    setDeviceMessage(null);
    setDeviceError(null);
  }

  function handleDeviceFormChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setDeviceForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleDeviceSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadInventoryData(token, deviceSearch);
  }

  async function handleCreateDevice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingDevice(true);
    setDeviceMessage(null);
    setDeviceError(null);

    try {
      const payload = {
        warehouseId: deviceForm.warehouseId,
        deviceTypeId: deviceForm.deviceTypeId,
        brandId: deviceForm.brandId,
        serialNumber: deviceForm.serialNumber,
        model: deviceForm.model || undefined,
        currentResponsibleName: deviceForm.currentResponsibleName || undefined,
        departmentId: deviceForm.departmentId || undefined,
        description: deviceForm.description || undefined,
        status: deviceForm.status,
      };

      const createdPayload = await apiFetch<ApiEntityResponse<Device>>("/devices", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const createdDevice = "data" in createdPayload ? createdPayload.data : createdPayload;

      setDeviceMessage(`Dispositivo ${createdDevice.deviceCode} creado correctamente.`);
      setDeviceForm((current) => ({
        ...emptyDeviceForm,
        warehouseId: current.warehouseId,
        deviceTypeId: current.deviceTypeId,
        brandId: current.brandId,
      }));
      await loadInventoryData(token, deviceSearch);
    } catch (error) {
      setDeviceError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el dispositivo.",
      );
    } finally {
      setIsSavingDevice(false);
    }
  }

  if (isCheckingSession) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-slate-100">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-slate-300">
          Validando sesion local...
        </div>
      </main>
    );
  }

  if (!token || !user) {
    return (
      <LoginScreen
        identifier={identifier}
        password={password}
        isLoggingIn={isLoggingIn}
        error={loginError}
        onIdentifierChange={setIdentifier}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
      />
    );
  }

  const availableDevices = devices.filter((device) => device.status === "AVAILABLE").length;
  const assignedDevices = devices.filter((device) => device.status === "ASSIGNED").length;
  const intakeWarehouse = warehouses.find((warehouse) => warehouse.code === "ALMACEN_IT");

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-white/10 bg-slate-950/90 px-5 py-6 lg:block">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-cyan-400 text-sm font-black text-slate-950">
              IT
            </div>
            <div>
              <p className="text-lg font-bold leading-tight">InventarioIT</p>
              <p className="text-xs text-slate-400">Operacion y activos</p>
            </div>
          </div>

          <nav className="mt-8 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition ${
                  activeModule === item.name
                    ? "bg-cyan-400 text-slate-950"
                    : "text-slate-300 hover:bg-white/8 hover:text-white"
                }`}
                onClick={() => setActiveModule(item.name)}
              >
                <item.icon className="size-4" />
                {item.name}
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/92 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/5 lg:hidden">
                  <Menu className="size-5" />
                </button>
                <div>
                  <h1 className="text-xl font-bold md:text-2xl">{activeModule}</h1>
                  <p className="text-sm text-slate-400">
                    {activeModule === "Tablero"
                      ? "Resumen ejecutivo de la operacion IT"
                      : "Modulo independiente de InventarioIT"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/5">
                  <Bell className="size-4" />
                </button>
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-right text-xs">
                  <p className="font-semibold text-white">{user.fullName}</p>
                  <p className="text-slate-400">{roleLabel}</p>
                </div>
                <button
                  className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-bold text-slate-200 hover:bg-white/10"
                  onClick={handleLogout}
                >
                  Salir
                </button>
              </div>
            </div>
          </header>

          <div className="space-y-6 px-4 py-6 md:px-8">
            {activeModule === "Tablero" ? (
            <section className="grid gap-3 md:grid-cols-4">
              {[
                ["Dispositivos", String(devices.length), `${availableDevices} disponibles`],
                ["Asignados", String(assignedDevices), "equipos en uso"],
                ["Entregas", "0", "formatos por conectar"],
                ["Tickets", "0", "modulo pendiente"],
              ].map(([label, value, hint]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm text-slate-400">{label}</p>
                  <p className="mt-2 text-3xl font-black">{value}</p>
                  <p className="mt-1 text-xs text-slate-500">{hint}</p>
                </div>
              ))}
            </section>
            ) : null}

            {activeModule === "Inventario" ? (
            <section className="rounded-lg border border-white/10 bg-white/[0.04]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
                <div>
                  <h2 className="text-lg font-bold">Inventario de dispositivos</h2>
                  <p className="text-sm text-slate-400">
                    Alta rapida y busqueda conectadas al API local.
                  </p>
                </div>
                <form className="flex w-full gap-2 md:w-auto" onSubmit={handleDeviceSearchSubmit}>
                  <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-slate-950 px-3 text-slate-400 md:w-80">
                    <Search className="size-4 shrink-0" />
                    <input
                      className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
                      value={deviceSearch}
                      onChange={(event) => setDeviceSearch(event.target.value)}
                      placeholder="Codigo, serie, modelo o responsable"
                    />
                  </div>
                  <button className="h-10 rounded-lg bg-cyan-400 px-4 text-sm font-black text-slate-950">
                    Buscar
                  </button>
                </form>
              </div>

              <form className="grid gap-3 border-b border-white/10 p-4 lg:grid-cols-4" onSubmit={handleCreateDevice}>
                <Field label="Entrada inicial">
                  <input
                    className="field-control"
                    value={
                      intakeWarehouse
                        ? `${intakeWarehouse.branch?.name ? `${intakeWarehouse.branch.name} · ` : ""}${intakeWarehouse.name}`
                        : "ALMACEN IT"
                    }
                    readOnly
                  />
                </Field>

                <Field label="Tipo">
                  <select
                    className="field-control"
                    name="deviceTypeId"
                    value={deviceForm.deviceTypeId}
                    onChange={handleDeviceFormChange}
                    required
                  >
                    {deviceTypes.map((deviceType) => (
                      <option key={deviceType.id} value={deviceType.id}>
                        {deviceType.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Marca">
                  <select
                    className="field-control"
                    name="brandId"
                    value={deviceForm.brandId}
                    onChange={handleDeviceFormChange}
                    required
                  >
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Estado">
                  <select
                    className="field-control"
                    name="status"
                    value={deviceForm.status}
                    onChange={handleDeviceFormChange}
                  >
                    <option value="AVAILABLE">Disponible</option>
                    <option value="ASSIGNED">Asignado</option>
                    <option value="MAINTENANCE">Mantenimiento</option>
                    <option value="RETIRED">Obsoleto</option>
                  </select>
                </Field>

                <Field label="Numero de serie">
                  <input
                    className="field-control"
                    name="serialNumber"
                    value={deviceForm.serialNumber}
                    onChange={handleDeviceFormChange}
                    placeholder="SN, IMEI o identificador"
                    required
                  />
                </Field>

                <Field label="Modelo">
                  <input
                    className="field-control"
                    name="model"
                    value={deviceForm.model}
                    onChange={handleDeviceFormChange}
                    placeholder="Modelo del equipo"
                  />
                </Field>

                <Field label="Responsable">
                  <input
                    className="field-control"
                    name="currentResponsibleName"
                    value={deviceForm.currentResponsibleName}
                    onChange={handleDeviceFormChange}
                    placeholder="Empleado o disponible"
                  />
                </Field>

                <Field label="Departamento">
                  <select
                    className="field-control"
                    name="departmentId"
                    value={deviceForm.departmentId}
                    onChange={handleDeviceFormChange}
                  >
                    <option value="">Sin departamento</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <label className="block lg:col-span-3">
                  <span className="text-xs font-bold text-slate-400">Descripcion / notas rapidas</span>
                  <textarea
                    className="mt-2 min-h-20 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-400/30 transition focus:border-cyan-300 focus:ring-4"
                    name="description"
                    value={deviceForm.description}
                    onChange={handleDeviceFormChange}
                    placeholder="Descripcion corta, accesorios, condicion o ubicacion."
                  />
                </label>

                <div className="flex items-end">
                  <button
                    className="h-11 w-full rounded-lg bg-emerald-400 px-4 text-sm font-black text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isSavingDevice || !deviceForm.warehouseId || !deviceForm.deviceTypeId || !deviceForm.brandId}
                  >
                    {isSavingDevice ? "Guardando..." : "Crear equipo"}
                  </button>
                </div>
              </form>

              {deviceMessage || deviceError ? (
                <div className="border-b border-white/10 px-4 py-3">
                  <p className={`text-sm font-semibold ${deviceError ? "text-rose-200" : "text-emerald-200"}`}>
                    {deviceError ?? deviceMessage}
                  </p>
                </div>
              ) : null}

              <DeviceTable devices={devices} isLoading={isLoadingDevices} />
            </section>
            ) : null}

            {activeModule === "Tablero" ? (
            <section className="rounded-lg border border-white/10 bg-white/[0.04]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
                <div>
                  <h2 className="text-lg font-bold">Modulos operativos</h2>
                  <p className="text-sm text-slate-400">Mapa inicial para avanzar modulo por modulo.</p>
                </div>
                <div className="flex h-10 min-w-64 items-center gap-2 rounded-lg border border-white/10 bg-slate-950 px-3 text-slate-400">
                  <Search className="size-4" />
                  <span className="text-sm">Buscar modulo, reporte o proceso</span>
                </div>
              </div>
              <div className="grid gap-px overflow-hidden rounded-b-lg bg-white/10 md:grid-cols-2 xl:grid-cols-4">
                {modules.map((module) => (
                  <div key={module.name} className="bg-slate-900 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <module.icon className="mt-1 size-5 text-cyan-300" />
                      <span className="rounded-md bg-emerald-400/12 px-2 py-1 text-xs font-bold text-emerald-200">
                        {module.status}
                      </span>
                    </div>
                    <h3 className="mt-4 font-bold">{module.name}</h3>
                    <p className="mt-1 text-sm leading-5 text-slate-400">{module.detail}</p>
                  </div>
                ))}
              </div>
            </section>
            ) : null}

            {activeModule === "Consumibles" ? (
            <section className="grid gap-6 xl:grid-cols-2">
              <DataTable
                title="Inventario de consumibles"
                subtitle="Stock central con minimo para alertas."
                headers={["Codigo", "Articulo", "Unidad", "Stock", "Min.", "Estado"]}
                rows={consumables.map((item) => [
                  item.code,
                  item.name,
                  item.unit,
                  String(item.stock),
                  String(item.min),
                  item.status,
                ])}
              />
            </section>
            ) : null}

            {[
              "Mantenimientos",
              "Entregas",
              "Tickets",
              "Usuarios",
              "Reglas",
            ].includes(activeModule) ? (
              <ModulePlaceholder
                moduleName={activeModule}
                devicesCount={devices.length}
              />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function LoginScreen({
  identifier,
  password,
  isLoggingIn,
  error,
  onIdentifierChange,
  onPasswordChange,
  onSubmit,
}: {
  identifier: string;
  password: string;
  isLoggingIn: boolean;
  error: string | null;
  onIdentifierChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="grid min-h-screen bg-slate-950 px-4 py-8 text-slate-100 md:grid-cols-[1.1fr_0.9fr] md:px-8">
      <section className="flex min-h-[40vh] flex-col justify-between rounded-lg border border-white/10 bg-white/[0.04] p-6 md:rounded-r-none md:p-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-lg bg-cyan-400 text-sm font-black text-slate-950">
              IT
            </div>
            <div>
              <p className="text-2xl font-black">InventarioIT</p>
              <p className="text-sm text-slate-400">Operacion, activos y soporte</p>
            </div>
          </div>

          <div className="mt-12 max-w-2xl">
            <p className="text-sm font-bold uppercase text-cyan-300">Pragma Works</p>
            <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
              Control real para inventario IT.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              Plataforma local para dispositivos, consumibles, entregas, firmas,
              tickets, mantenimientos, reportes y automatizaciones.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-slate-950/70 p-4">
            <p className="font-bold text-white">Roles</p>
            <p className="mt-1 text-slate-400">Menus y permisos por usuario.</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-950/70 p-4">
            <p className="font-bold text-white">Archivos</p>
            <p className="mt-1 text-slate-400">Fotos, firmas y documentos.</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-950/70 p-4">
            <p className="font-bold text-white">Reportes</p>
            <p className="mt-1 text-slate-400">Excel, PDF y formatos.</p>
          </div>
        </div>
      </section>

      <section className="flex items-center rounded-lg border border-t-0 border-white/10 bg-slate-900 p-6 md:rounded-l-none md:border-l-0 md:border-t md:p-8">
        <form className="w-full space-y-5" onSubmit={onSubmit}>
          <div>
            <h2 className="text-2xl font-black">Iniciar sesion</h2>
            <p className="mt-2 text-sm text-slate-400">
              Solicita tus credenciales al administrador del sistema.
            </p>
          </div>

          <label className="block">
            <span className="text-sm font-bold text-slate-300">Usuario o correo</span>
            <input
              className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-base text-white outline-none ring-cyan-400/30 transition focus:border-cyan-300 focus:ring-4"
              value={identifier}
              onChange={(event) => onIdentifierChange(event.target.value)}
              placeholder="ivan.orpineda@pragmaworks.com"
              autoComplete="username"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-300">Contrasena</span>
            <input
              className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-base text-white outline-none ring-cyan-400/30 transition focus:border-cyan-300 focus:ring-4"
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error ? (
            <div className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm font-semibold text-rose-100">
              {error}
            </div>
          ) : null}

          <button
            className="h-12 w-full rounded-lg bg-cyan-400 px-4 text-sm font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-xs leading-5 text-slate-500">
            El acceso se valida contra el API local de InventarioIT. No se
            muestran credenciales demo en pantalla.
          </p>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-slate-400">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function DeviceTable({
  devices,
  isLoading,
}: {
  devices: Device[];
  isLoading: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse text-left text-sm">
        <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            {[
              "Codigo",
              "Tipo",
              "Marca",
              "Serie",
              "Modelo",
              "Bodega",
              "Responsable",
              "Estado",
            ].map((header) => (
              <th key={header} className="px-4 py-3 font-bold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr className="border-t border-white/8">
              <td className="px-4 py-6 text-slate-400" colSpan={8}>
                Cargando inventario...
              </td>
            </tr>
          ) : null}

          {!isLoading && devices.length === 0 ? (
            <tr className="border-t border-white/8">
              <td className="px-4 py-6 text-slate-400" colSpan={8}>
                No hay dispositivos registrados todavia.
              </td>
            </tr>
          ) : null}

          {!isLoading
            ? devices.map((device) => (
                <tr key={device.id} className="border-t border-white/8">
                  <td className="whitespace-nowrap px-4 py-3 font-bold text-white">
                    {device.deviceCode}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-200">
                    {device.deviceTypeName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-200">
                    {device.brandName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-200">
                    {device.serialNumber}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-200">
                    {device.model ?? "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-200">
                    {device.warehouseName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-200">
                    {device.currentResponsibleName ?? "Disponible"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="rounded-md bg-cyan-400/10 px-2 py-1 text-xs font-bold text-cyan-200">
                      {device.status}
                    </span>
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </div>
  );
}

function ModulePlaceholder({
  moduleName,
  devicesCount,
}: {
  moduleName: ModuleName;
  devicesCount: number;
}) {
  const isMaintenance = moduleName === "Mantenimientos";

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase text-cyan-300">
          {isMaintenance ? "Ligado a inventario" : "Modulo independiente"}
        </p>
        <h2 className="mt-2 text-2xl font-black">{moduleName}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {isMaintenance
            ? `Este modulo se construira conectado a los ${devicesCount} equipos registrados para historial, servicios, evidencias y proximas fechas.`
            : "Esta pantalla queda separada del tablero para construir su flujo propio sin amontonar procesos de otros modulos."}
        </p>
      </div>
    </section>
  );
}

function DataTable({
  title,
  subtitle,
  headers,
  rows,
}: {
  title: string;
  subtitle: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <section className="min-w-0 rounded-lg border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 p-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-bold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.join("-")} className="border-t border-white/8">
                {row.map((cell, index) => (
                  <td key={`${cell}-${index}`} className="whitespace-nowrap px-4 py-3 text-slate-200">
                    {index === row.length - 1 ? (
                      <span className="rounded-md bg-cyan-400/10 px-2 py-1 text-xs font-bold text-cyan-200">
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
