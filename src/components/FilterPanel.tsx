import { useState, useEffect } from "react";
import { X, Filter, ChevronDown, ChevronUp, Search } from "lucide-react";
import Multiselect from 'multiselect-react-dropdown';
import useDebounce from "../hooks/useDebounce";
import { Card, Badge } from "./ui/design-system";
import { fetchCompanies, fetchCountries, type CompanyOption } from "../api/combo";

interface FilterState {
    company_name: string[];
    person_name: string;
    department: string;
    designation: string;
    company_type: string;
    person_country: string[];
    company_country: string[];
    city: string;
}

interface FilterPanelProps {
    onFilter: (filters: FilterState) => void;
    isMobile: boolean;
    isLoading?: boolean;
}

const initialFilters: FilterState = {
    company_name: [],
    person_name: "",
    department: "",
    designation: "",
    company_type: "",
    person_country: [],
    company_country: [],
    city: ""
};

// Static dropdown options
const DEPARTMENTS = ['Sales', 'Purchase', 'Supply Chain', 'Marketing', 'R&D'];
const COMPANY_TYPES = ['Medical', 'Pharmaceutical', 'Healthcare', 'Research', 'Other'];



const FilterPanel = ({ onFilter, isMobile, isLoading = false }: FilterPanelProps) => {
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [localPersonName, setLocalPersonName] = useState("");
    const [localDesignation, setLocalDesignation] = useState("");
    const [localCity, setLocalCity] = useState("");
    const [isOpen, setIsOpen] = useState(true);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    // State for companies dropdown
    const [companies, setCompanies] = useState<CompanyOption[]>([]);
    const [selectedCompanies, setSelectedCompanies] = useState<CompanyOption[]>([]);
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

    // State for person countries dropdown
    const [countries, setCountries] = useState<CompanyOption[]>([]);
    const [selectedPersonCountries, setSelectedPersonCountries] = useState<CompanyOption[]>([]);
    const [isLoadingCountries, setIsLoadingCountries] = useState(false);

    // State for company countries dropdown
    const [selectedCompanyCountries, setSelectedCompanyCountries] = useState<CompanyOption[]>([]);

    const debouncedPersonName = useDebounce(localPersonName, 500);
    const debouncedDesignation = useDebounce(localDesignation, 500);
    const debouncedCity = useDebounce(localCity, 500);

    // Load companies and countries on component mount
    useEffect(() => {
        const loadData = async () => {
            setIsLoadingCompanies(true);
            setIsLoadingCountries(true);

            try {
                const [companyData, countryData] = await Promise.all([
                    fetchCompanies(),
                    fetchCountries()
                ]);
                setCompanies(companyData);
                setCountries(countryData);
            } catch (error) {
                console.error('Failed to load dropdown data:', error);
            } finally {
                setIsLoadingCompanies(false);
                setIsLoadingCountries(false);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        const count = Object.values(filters).filter(value => {
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            return value !== "" && value !== "All";
        }).length;
        setActiveFiltersCount(count);
    }, [filters]);

    useEffect(() => {
        handleChange("person_name", debouncedPersonName);
    }, [debouncedPersonName]);

    useEffect(() => {
        handleChange("designation", debouncedDesignation);
    }, [debouncedDesignation]);

    useEffect(() => {
        handleChange("city", debouncedCity);
    }, [debouncedCity]);

    const handleChange = (key: keyof FilterState, value: string | string[]) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilter(newFilters);
    };

    const handleCompanySelect = (selectedList: CompanyOption[]) => {
        setSelectedCompanies(selectedList);
        const companyNames = selectedList.map(company => company.name);
        handleChange("company_name", companyNames);
    };

    const handlePersonCountrySelect = (selectedList: CompanyOption[]) => {
        setSelectedPersonCountries(selectedList);
        const countryIds = selectedList.map(country => country.id);
        handleChange("person_country", countryIds);
    };

    const handleCompanyCountrySelect = (selectedList: CompanyOption[]) => {
        setSelectedCompanyCountries(selectedList);
        const countryIds = selectedList.map(country => country.id);
        handleChange("company_country", countryIds);
    };



    const handleReset = () => {
        setFilters(initialFilters);
        setSelectedCompanies([]);
        setSelectedPersonCountries([]);
        setSelectedCompanyCountries([]);
        setLocalPersonName("");
        setLocalDesignation("");
        setLocalCity("");
        // Trigger API call immediately when clearing all filters
        onFilter(initialFilters);
    };

    const clearField = (field: keyof FilterState) => {
        let newFilters = { ...filters };

        switch (field) {
            case 'company_name':
                setSelectedCompanies([]);
                newFilters.company_name = [];
                break;
            case 'person_name':
                setLocalPersonName("");
                newFilters.person_name = "";
                break;
            case 'department':
                newFilters.department = "";
                break;
            case 'designation':
                setLocalDesignation("");
                newFilters.designation = "";
                break;
            case 'company_type':
                newFilters.company_type = "";
                break;
            case 'person_country':
                setSelectedPersonCountries([]);
                newFilters.person_country = [];
                break;
            case 'company_country':
                setSelectedCompanyCountries([]);
                newFilters.company_country = [];
                break;
            case 'city':
                setLocalCity("");
                newFilters.city = "";
                break;
        }

        // Update filters state and trigger API call immediately
        setFilters(newFilters);
        onFilter(newFilters);
    };

    return (
        <Card variant="elevated" padding="none" >
            {/* Filter Header */}
            {!isMobile ? (
                <button
                    className="w-full p-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-controls="filter-content"
                >
                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-neutral-500" />
                        <h2 className="text-lg font-semibold text-neutral-900">Filters</h2>
                        {activeFiltersCount > 0 && (
                            <Badge variant="primary" size="sm">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="text-neutral-500 hover:text-neutral-700 p-1 hover:bg-neutral-200 rounded-full transition-colors cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleReset();
                            }}
                            title="Reset filters"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleReset();
                                }
                            }}
                        >
                            <X size={18} />
                        </div>
                        <span className="text-neutral-500 hover:text-neutral-700 p-1 hover:bg-neutral-200 rounded-full transition-colors">
                            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </span>
                    </div>
                </button>
            ) : (
                <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-neutral-500" />
                        <h2 className="text-lg font-semibold text-neutral-900">Filters</h2>
                        {activeFiltersCount > 0 && (
                            <Badge variant="primary" size="sm">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </div>
                    <button
                        className="text-neutral-500 hover:text-neutral-700 p-1 hover:bg-neutral-200 rounded-full transition-colors"
                        onClick={handleReset}
                        title="Reset filters"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Filter Content */}
            <div
                id="filter-content"
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-4 space-y-6">
                    {/* Company Name Multiselect */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name
                        </label>
                        <div className="relative">
                            <Multiselect
                                options={companies}
                                selectedValues={selectedCompanies}
                                onSelect={handleCompanySelect}
                                onRemove={handleCompanySelect}
                                displayValue="name"
                                placeholder="Search and select company names..."
                                emptyRecordMsg="No companies found. Try a different search term."
                                showCheckbox={true}
                                closeIcon="cancel"
                                showArrow={true}

                                style={{
                                    chips: {
                                        background: '#3B82F6',
                                        color: 'white',
                                        fontSize: '14px',
                                        borderRadius: '6px',
                                        padding: '4px 8px',
                                        margin: '2px'
                                    },
                                    searchBox: {
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        minHeight: '42px',
                                        backgroundColor: 'white'
                                    },
                                    inputField: {
                                        margin: '0px',
                                        fontSize: '14px',
                                        color: '#374151',
                                        backgroundColor: 'transparent'
                                    },
                                    option: {
                                        color: '#374151',
                                        backgroundColor: 'white',
                                        padding: '10px 12px',
                                        fontSize: '14px',
                                        borderBottom: '1px solid #F3F4F6',
                                        cursor: 'pointer'
                                    },
                                    optionContainer: {
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '8px',
                                        maxHeight: '250px',
                                        marginTop: '4px',
                                        backgroundColor: 'white',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        zIndex: 1000
                                    },
                                    multiselectContainer: {
                                        color: '#374151'
                                    },
                                    highlightOption: {
                                        backgroundColor: '#EBF8FF',
                                        color: '#1E40AF'
                                    }
                                }}
                                loading={isLoadingCompanies}
                                disable={isLoading || isLoadingCompanies}
                            />
                            {selectedCompanies.length > 0 && (
                                <button
                                    onClick={() => clearField('company_name')}
                                    disabled={isLoading}
                                    className={`absolute right-3 top-3 transition-colors z-10 ${isLoading
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    title={isLoading ? 'Loading...' : 'Clear company names'}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Person Name Input */}
                    <div>
                        <label htmlFor="person-name-input" className="block text-sm font-medium text-gray-700 mb-2">
                            Person Name
                        </label>
                        <div className="relative">
                            <input
                                id="person-name-input"
                                type="text"
                                value={localPersonName}
                                onChange={(e) => setLocalPersonName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-10"
                                placeholder="Search by person name..."
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            {localPersonName && (
                                <button
                                    onClick={() => clearField('person_name')}
                                    disabled={isLoading}
                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${isLoading
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    title={isLoading ? 'Loading...' : 'Clear person name'}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Department Dropdown */}
                    <div>
                        <label htmlFor="department-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Department
                        </label>
                        <div className="relative">
                            <select
                                id="department-select"
                                value={filters.department}
                                onChange={(e) => handleChange('department', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                                disabled={isLoading}
                            >
                                <option value="">Select department</option>
                                {DEPARTMENTS.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            {filters.department && (
                                <button
                                    onClick={() => clearField('department')}
                                    disabled={isLoading}
                                    className={`absolute right-8 top-1/2 transform -translate-y-1/2 transition-colors ${isLoading
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    title={isLoading ? 'Loading...' : 'Clear department'}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Designation Input */}
                    <div>
                        <label htmlFor="designation-input" className="block text-sm font-medium text-gray-700 mb-2">
                            Designation
                        </label>
                        <div className="relative">
                            <input
                                id="designation-input"
                                type="text"
                                value={localDesignation}
                                onChange={(e) => setLocalDesignation(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-10"
                                placeholder="Search by designation..."
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            {localDesignation && (
                                <button
                                    onClick={() => clearField('designation')}
                                    disabled={isLoading}
                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${isLoading
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    title={isLoading ? 'Loading...' : 'Clear designation'}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Company Type Dropdown */}
                    <div>
                        <label htmlFor="company-type-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Company Type
                        </label>
                        <div className="relative">
                            <select
                                id="company-type-select"
                                value={filters.company_type}
                                onChange={(e) => handleChange('company_type', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                                disabled={isLoading}
                            >
                                <option value="">Select company type</option>
                                {COMPANY_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            {filters.company_type && (
                                <button
                                    onClick={() => clearField('company_type')}
                                    disabled={isLoading}
                                    className={`absolute right-8 top-1/2 transform -translate-y-1/2 transition-colors ${isLoading
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    title={isLoading ? 'Loading...' : 'Clear company type'}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Person Country Multiselect */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Person Country
                        </label>
                        <div className="relative">
                            <Multiselect
                                options={countries}
                                selectedValues={selectedPersonCountries}
                                onSelect={handlePersonCountrySelect}
                                onRemove={handlePersonCountrySelect}
                                displayValue="name"
                                placeholder="Search and select person countries..."
                                emptyRecordMsg="No person countries found. Try a different search term."
                                showCheckbox={true}
                                closeIcon="cancel"
                                showArrow={true}

                                style={{
                                    chips: {
                                        background: '#3B82F6',
                                        color: 'white',
                                        fontSize: '14px',
                                        borderRadius: '6px',
                                        padding: '4px 8px',
                                        margin: '2px'
                                    },
                                    searchBox: {
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        minHeight: '42px',
                                        backgroundColor: 'white'
                                    },
                                    inputField: {
                                        margin: '0px',
                                        fontSize: '14px',
                                        color: '#374151',
                                        backgroundColor: 'transparent'
                                    },
                                    option: {
                                        color: '#374151',
                                        backgroundColor: 'white',
                                        padding: '10px 12px',
                                        fontSize: '14px',
                                        borderBottom: '1px solid #F3F4F6',
                                        cursor: 'pointer'
                                    },
                                    optionContainer: {
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '8px',
                                        maxHeight: '250px',
                                        marginTop: '4px',
                                        backgroundColor: 'white',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        zIndex: 1000
                                    },
                                    multiselectContainer: {
                                        color: '#374151'
                                    },
                                    highlightOption: {
                                        backgroundColor: '#EBF8FF',
                                        color: '#1E40AF'
                                    }
                                }}
                                loading={isLoadingCountries}
                                disable={isLoading || isLoadingCountries}
                            />
                            {selectedPersonCountries.length > 0 && (
                                <button
                                    onClick={() => clearField('person_country')}
                                    disabled={isLoading}
                                    className={`absolute right-3 top-3 transition-colors z-10 ${isLoading
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    title={isLoading ? 'Loading...' : 'Clear person countries'}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Company Country Multiselect */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Country
                        </label>
                        <div className="relative">
                            <Multiselect
                                options={countries}
                                selectedValues={selectedCompanyCountries}
                                onSelect={handleCompanyCountrySelect}
                                onRemove={handleCompanyCountrySelect}
                                displayValue="name"
                                placeholder="Search and select company countries..."
                                emptyRecordMsg="No company countries found. Try a different search term."
                                showCheckbox={true}
                                closeIcon="cancel"
                                showArrow={true}

                                style={{
                                    chips: {
                                        background: '#3B82F6',
                                        color: 'white',
                                        fontSize: '14px',
                                        borderRadius: '6px',
                                        padding: '4px 8px',
                                        margin: '2px'
                                    },
                                    searchBox: {
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        minHeight: '42px',
                                        backgroundColor: 'white'
                                    },
                                    inputField: {
                                        margin: '0px',
                                        fontSize: '14px',
                                        color: '#374151',
                                        backgroundColor: 'transparent'
                                    },
                                    option: {
                                        color: '#374151',
                                        backgroundColor: 'white',
                                        padding: '10px 12px',
                                        fontSize: '14px',
                                        borderBottom: '1px solid #F3F4F6',
                                        cursor: 'pointer'
                                    },
                                    optionContainer: {
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '8px',
                                        maxHeight: '250px',
                                        marginTop: '4px',
                                        backgroundColor: 'white',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        zIndex: 1000
                                    },
                                    multiselectContainer: {
                                        color: '#374151'
                                    },
                                    highlightOption: {
                                        backgroundColor: '#EBF8FF',
                                        color: '#1E40AF'
                                    }
                                }}
                                loading={isLoadingCountries}
                                disable={isLoading || isLoadingCountries}
                            />
                            {selectedCompanyCountries.length > 0 && (
                                <button
                                    onClick={() => clearField('company_country')}
                                    disabled={isLoading}
                                    className={`absolute right-3 top-3 transition-colors z-10 ${isLoading
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    title={isLoading ? 'Loading...' : 'Clear company countries'}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* City Input */}
                    <div>
                        <label htmlFor="city-input" className="block text-sm font-medium text-gray-700 mb-2">
                            City
                        </label>
                        <div className="relative">
                            <input
                                id="city-input"
                                type="text"
                                value={localCity}
                                onChange={(e) => setLocalCity(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-10"
                                placeholder="Search by city..."
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            {localCity && (
                                <button
                                    onClick={() => clearField('city')}
                                    disabled={isLoading}
                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${isLoading
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    title={isLoading ? 'Loading...' : 'Clear city'}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search and Clear Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => {
                                // Trigger immediate search with current values
                                const newFilters = {
                                    company_name: selectedCompanies.map(company => company.name),
                                    person_name: localPersonName,
                                    department: filters.department,
                                    designation: localDesignation,
                                    company_type: filters.company_type,
                                    person_country: selectedPersonCountries.map(country => country.id),
                                    company_country: selectedCompanyCountries.map(country => country.id),
                                    city: localCity
                                };
                                setFilters(newFilters);
                                onFilter(newFilters);
                            }}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 ${isLoading
                                ? 'bg-blue-400 text-white cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            <Search size={16} />
                            Search

                        </button>
                        <button
                            onClick={handleReset}
                            disabled={isLoading}
                            className={`px-4 py-2.5 border rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center gap-2 ${isLoading
                                ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                                    Clearing...
                                </>
                            ) : (
                                <>
                                    <X size={16} />
                                    Clear All
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Card >
    );
};

export default FilterPanel;
